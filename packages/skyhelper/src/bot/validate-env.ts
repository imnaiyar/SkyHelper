import { SnowflakeRegex, TokenRegex, WebhookRegex } from "@sapphire/discord-utilities";
import { z } from "zod/v4";
const WebhookPredicate = z
  .string()
  .regex(new RegExp(`^(${WebhookRegex.source})?$`))
  .optional();
const EnvPredicate = z.object({
  TOKEN: z.string().regex(TokenRegex),
  MONGO_CONNECTION: z.string(),
  SENTRY_DSN: z.string(), // required for sentry error tracking
  SENTRY_AUTH_TOKEN: z.string().optional(), // generally optional, but required when uploading source maps. using dockerfile assumes it is present, no check is done
  PUBLIC_KEY: z.string(), // required for api for recieving webhook events
  CLIENT_ID: z.string().regex(SnowflakeRegex), // bots id
  NODE_ENV: z.enum(["development", "production"]).optional(),
  NODE_OPTIONS: z.string().optional(),
  DBL_TOKEN: z.string().optional(),
  TOPGG_TOKEN: z.string().optional(),
  BUG_REPORTS: WebhookPredicate,
  COMMANDS_USED: WebhookPredicate,
  CONTACT_US: WebhookPredicate,
  ERROR_LOGS: WebhookPredicate,
  GUILD: WebhookPredicate,
  READY_LOGS: WebhookPredicate,
  SUGGESTION: WebhookPredicate,
});

const results = EnvPredicate.safeParse(process.env);

if (!results.success) {
  console.error("\x1b[31mInvalid environment variables:\x1b[0m\n", z.prettifyError(results.error));
  process.exit(1);
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof EnvPredicate> {}
  }
}
