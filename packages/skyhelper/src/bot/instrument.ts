import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// initialize sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    nodeProfilingIntegration(),
    Sentry.rewriteFramesIntegration({
      root: import.meta.dirname,
    }),
  ],
  environment: process.env.NODE_ENV,

  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});
