import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { ExecutionContext } from "@nestjs/common";
import config from "@/config";

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected override shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const origin = request.headers.origin as string | undefined;

    // Skip rate limiting for requests from dashboard origins
    if (origin && config.DASHBOARD.WEB_URL.includes(origin)) {
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  }
}
