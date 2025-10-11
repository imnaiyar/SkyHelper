import { z } from "zod/v4";

const EnvPredicate = z.object({
  TOKEN: z.string(),
  MONGO_CONNECTION: z.string(),
  SENTRY_DSN_BUN: z.string(),
  NODE_ENV: z.enum(["development", "production"]).optional(),
  ERROR_WEBHOOK: z.string().optional(),
  JOBS_DEBUG_LOGS: z.string().optional(),
  API_ALLOWLIST_KEY: z.string(),
});

const results = EnvPredicate.safeParse(process.env);

if (!results.success) {
  console.error("\x1b[31mInvalid environment variables:\x1b[0m\n", z.prettifyError(results.error));
  process.exit(1);
}

/* eslint-disable */
declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof EnvPredicate> {}
  }
}
