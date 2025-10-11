import * as Sentry from "@sentry/bun";
// initialize sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN_BUN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
});
