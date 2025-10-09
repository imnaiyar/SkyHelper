import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { CustomThrottlerGuard } from "../src/api/guards/throttler.guard.js";
import { ExecutionContext } from "@nestjs/common";

// Mock environment variable
const originalEnv = process.env.API_ALLOWLIST_KEY;

describe("CustomThrottlerGuard", () => {
  beforeEach(() => {
    process.env.API_ALLOWLIST_KEY = "test-api-key";
  });

  afterEach(() => {
    process.env.API_ALLOWLIST_KEY = originalEnv;
  });

  it("should skip rate limiting with valid API key", async () => {
    const guard = new CustomThrottlerGuard({ ttl: 60000, limit: 100 }, {} as any, {} as any, {} as any);

    const mockRequest = {
      headers: {
        "x-api-key": "test-api-key",
      },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const shouldSkip = await (guard as any).shouldSkip(mockContext);
    expect(shouldSkip).toBe(true);
  });

  it("should not skip rate limiting with invalid API key", async () => {
    const guard = new CustomThrottlerGuard({ ttl: 60000, limit: 100 }, {} as any, {} as any, {} as any);

    const mockRequest = {
      headers: {
        "x-api-key": "wrong-api-key",
      },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const shouldSkip = await (guard as any).shouldSkip(mockContext);
    expect(shouldSkip).toBe(false);
  });

  it("should not skip rate limiting without API key", async () => {
    const guard = new CustomThrottlerGuard({ ttl: 60000, limit: 100 }, {} as any, {} as any, {} as any);

    const mockRequest = {
      headers: {},
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const shouldSkip = await (guard as any).shouldSkip(mockContext);
    expect(shouldSkip).toBe(false);
  });

  it("should not skip rate limiting when API key is missing from environment", async () => {
    process.env.API_ALLOWLIST_KEY = "";
    const guard = new CustomThrottlerGuard({ ttl: 60000, limit: 100 }, {} as any, {} as any, {} as any);

    const mockRequest = {
      headers: {
        "x-api-key": "test-api-key",
      },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const shouldSkip = await (guard as any).shouldSkip(mockContext);
    expect(shouldSkip).toBe(false);
  });
});
