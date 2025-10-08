import { describe, expect, it, vi } from "vitest";
import { CustomThrottlerGuard } from "../src/api/guards/throttler.guard.js";
import { ExecutionContext } from "@nestjs/common";

describe("CustomThrottlerGuard", () => {
  it("should skip rate limiting for dashboard origins", async () => {
    const guard = new CustomThrottlerGuard({ ttl: 60000, limit: 100 }, {} as any, {} as any, {} as any);

    const mockRequest = {
      headers: {
        origin: "https://dash.skyhelper.xyz",
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

  it("should skip rate limiting for localhost dashboard", async () => {
    const guard = new CustomThrottlerGuard({ ttl: 60000, limit: 100 }, {} as any, {} as any, {} as any);

    const mockRequest = {
      headers: {
        origin: "http://localhost:3000",
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

  it("should not skip rate limiting for non-dashboard origins", async () => {
    const guard = new CustomThrottlerGuard({ ttl: 60000, limit: 100 }, {} as any, {} as any, {} as any);

    const mockRequest = {
      headers: {
        origin: "https://some-other-site.com",
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

  it("should not skip rate limiting when origin header is missing", async () => {
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
});
