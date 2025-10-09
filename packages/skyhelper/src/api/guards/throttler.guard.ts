import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { ExecutionContext } from "@nestjs/common";

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
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
}
