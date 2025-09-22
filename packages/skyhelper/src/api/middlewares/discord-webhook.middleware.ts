import { Injectable, type NestMiddleware } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

function hextToUint8(value: string) {
  const matches = value.match(/.{1,2}/g);
  if (matches == null) {
    throw new Error("Value is not a valid hex string");
  }
  const hexVal = matches.map((byte: string) => Number.parseInt(byte, 16));
  return new Uint8Array(hexVal);
}
@Injectable()
export class WebhookEventMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    // Get the headers
    const timestamp = req.header("X-Signature-Timestamp");
    const signature = req.header("X-Signature-Ed25519");
    if (!timestamp || !signature) {
      return res.status(401).send("Invalid Signature");
    }
    let body = req.body;

    // Nestjs converts the buffer, so convert it back
    if (!Buffer.isBuffer(body)) body = Buffer.from(JSON.stringify(body), "utf-8");

    const pubKey = await crypto.subtle.importKey(
      "raw",
      hextToUint8(process.env.PUBLIC_KEY),
      { name: "ED25519", namedCurve: "NODE-ED25519" },
      false,
      ["verify"],
    );

    // Verify the signature
    const isValid = await crypto.subtle.verify(
      { name: "ED25519" },
      pubKey,
      hextToUint8(signature),
      new TextEncoder().encode(timestamp + body),
    );

    if (!isValid) {
      return res.status(401).send("Invalid Signature");
    }
    const parsed = JSON.parse(body.toString("utf-8"));

    // If it's a ping, send a pong response
    if (parsed.type === 0) {
      res.status(201).json({ type: 0 });
      return;
    }
    next();
  }
}
