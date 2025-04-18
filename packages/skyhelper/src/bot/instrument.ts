import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { nestIntegration } from "@sentry/nestjs";
// initialize sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration(), Sentry.extraErrorDataIntegration({ depth: 9 }), nestIntegration()],
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});
