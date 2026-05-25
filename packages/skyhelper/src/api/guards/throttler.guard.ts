import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { ExecutionContext } from "@nestjs/common";
import crypto from "node:crypto";
import mongoose from "mongoose";
import { ApiKeyModel, hashApiKey } from "@/schemas/ApiKeySchema";
import type { ApiKeySchema } from "@/types/schemas";

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  private async resolveApiKey(req: Record<string, any>) {
    if (req.apiKeyContext?.resolved) return req.apiKeyContext as ApiKeyContext;

    const apiKey = req.headers["x-api-key"];
    if (!apiKey || typeof apiKey !== "string") {
      req.apiKeyContext = { resolved: true, record: null };
      return req.apiKeyContext as ApiKeyContext;
    }

    if (apiKey === process.env.API_ALLOWLIST_KEY) {
      req.apiKeyContext = { resolved: true, record: null, apiKey };
      return req.apiKeyContext as ApiKeyContext;
    }

    if (mongoose.connection.readyState !== mongoose.ConnectionStates.connected) {
      req.apiKeyContext = { resolved: true, record: null, apiKey };
      return req.apiKeyContext as ApiKeyContext;
    }

    const keyPrefix = apiKey.slice(0, 8);
    let apiKeyRecord = await ApiKeyModel.findOne({ keyPrefix, isActive: true }).lean<ApiKeySchema>().exec();
    let keyHash: string | undefined;

    if (apiKeyRecord) {
      keyHash = hashApiKey(apiKey, apiKeyRecord.keySalt);
      const recordedHash = Buffer.from(apiKeyRecord.keyHash, "hex");
      const computedHash = Buffer.from(keyHash, "hex");
      const matches = recordedHash.length === computedHash.length && crypto.timingSafeEqual(recordedHash, computedHash);
      if (!matches) {
        apiKeyRecord = null;
        keyHash = undefined;
      }
    }

    req.apiKeyContext = { resolved: true, record: apiKeyRecord, keyHash, apiKey };
    return req.apiKeyContext as ApiKeyContext;
  }

  protected override shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers["x-api-key"] as string | undefined;

    // skip rate limiting for requests with valid dashboard API key
    // this is so our own services aren't subjected to ratelimits and can work properly
    if (apiKey && apiKey === process.env.API_ALLOWLIST_KEY) {
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  }

  protected override async getTracker(req: Record<string, any>, _context?: ExecutionContext): Promise<string> {
    const apiKeyContext = await this.resolveApiKey(req);
    if (apiKeyContext.record && apiKeyContext.keyHash) {
      return `api-key:${apiKeyContext.keyHash}`;
    }

    return super.getTracker(req);
  }

  protected override async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const { req } = this.getRequestResponse(requestProps.context);
    const apiKeyContext = await this.resolveApiKey(req);
    if (apiKeyContext.record?.rateLimit) {
      const { limit, ttl } = apiKeyContext.record.rateLimit;
      const blockDuration = requestProps.throttler.blockDuration ?? ttl;
      return super.handleRequest({
        ...requestProps,
        limit,
        ttl,
        blockDuration,
      });
    }

    return super.handleRequest(requestProps);
  }
}

interface ApiKeyContext {
  resolved: true;
  apiKey?: string;
  keyHash?: string;
  record: ApiKeySchema | null;
}

type ThrottlerRequest = Parameters<ThrottlerGuard["handleRequest"]>[0];
