import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { ExecutionContext } from "@nestjs/common";
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

    const keyHash = hashApiKey(apiKey);
    const record = await ApiKeyModel.findOne({ keyHash, isActive: true }).lean<ApiKeySchema>().exec();
    req.apiKeyContext = { resolved: true, record, keyHash, apiKey };
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
