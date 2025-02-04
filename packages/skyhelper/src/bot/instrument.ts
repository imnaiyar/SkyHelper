import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { nestIntegration } from "@sentry/nestjs";
// initialize sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    nodeProfilingIntegration(),
    Sentry.rewriteFramesIntegration({
      root: process
        .cwd()
        // mainly for windows
        .replaceAll("C:\\", "")
        .replaceAll("\\", "/"),
      prefix: "app://",
    }),
    Sentry.extraErrorDataIntegration({ depth: 9 }),
    // @ts-expect-error typings mismatch due to @sentry/nestjs using older peer of nestjs
    nestIntegration(),
  ],
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});
