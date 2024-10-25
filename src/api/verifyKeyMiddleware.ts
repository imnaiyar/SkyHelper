import { concatUint8Arrays, subtleCrypto, valueToUint8Array } from "./keyUtils.js";
import type { Request, Response, NextFunction } from "express";
/**
 * Validates a payload from Discord against its signature and key.
 *
 * @param rawBody - The raw payload data
 * @param signature - The signature from the `X-Signature-Ed25519` header
 * @param timestamp - The timestamp from the `X-Signature-Timestamp` header
 * @param clientPublicKey - The public key from the Discord developer dashboard
 * @returns Whether or not validation was successful
 */
export async function verifyKey(
  rawBody: Uint8Array | ArrayBuffer | Buffer | string,
  signature: string,
  timestamp: string,
  clientPublicKey: string | CryptoKey,
): Promise<boolean> {
  try {
    const timestampData = valueToUint8Array(timestamp);
    const bodyData = valueToUint8Array(rawBody);
    const message = concatUint8Arrays(timestampData, bodyData);
    const publicKey =
      typeof clientPublicKey === "string"
        ? await subtleCrypto.importKey(
            "raw",
            valueToUint8Array(clientPublicKey, "hex"),
            {
              name: "ed25519",
              namedCurve: "ed25519",
            },
            false,
            ["verify"],
          )
        : clientPublicKey;
    const isValid = await subtleCrypto.verify(
      {
        name: "ed25519",
      },
      publicKey,
      valueToUint8Array(signature, "hex"),
      message,
    );
    return isValid;
  } catch (_ex) {
    return false;
  }
}

/**
 * Creates a middleware function for use in Express-compatible web servers.
 *
 * @param clientPublicKey - The public key from the Discord developer dashboard
 * @returns The middleware function
 */
export function verifyKeyMiddleware(clientPublicKey: string): (req: Request, res: Response, next: NextFunction) => void {
  if (!clientPublicKey) {
    throw new Error("You must specify a Discord client public key");
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    const timestamp = req.header("X-Signature-Timestamp") || "";
    const signature = req.header("X-Signature-Ed25519") || "";

    if (!timestamp || !signature) {
      res.statusCode = 401;
      res.end("[discord-interactions] Invalid signature");
      return;
    }

    async function onBodyComplete(rawBody: Buffer) {
      const isValid = await verifyKey(rawBody, signature, timestamp, clientPublicKey);
      if (!isValid) {
        res.statusCode = 401;
        res.end("[discord-interactions] Invalid signature");
        return;
      }

      const body = JSON.parse(rawBody.toString("utf-8")) || {};
      // Ping
      if (body.type === 0) {
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            type: 0,
          }),
        );
        return;
      }

      req.body = body;
      next();
    }

    if (req.body) {
      if (Buffer.isBuffer(req.body)) {
        await onBodyComplete(req.body);
      } else if (typeof req.body === "string") {
        await onBodyComplete(Buffer.from(req.body, "utf-8"));
      } else {
        console.warn(
          "[Event-Webhooks]: req.body was tampered with, probably by some other middleware. We recommend disabling middleware for interaction routes so that req.body is a raw buffer.",
        );
        // Attempt to reconstruct the raw buffer. This works but is risky
        // because it depends on JSON.stringify matching the Discord backend's
        // JSON serialization.
        await onBodyComplete(Buffer.from(JSON.stringify(req.body), "utf-8"));
      }
    } else {
      const chunks: Array<Buffer> = [];
      req.on("data", (chunk) => {
        chunks.push(chunk);
      });
      req.on("end", async () => {
        const rawBody = Buffer.concat(chunks);
        await onBodyComplete(rawBody);
      });
    }
  };
}
