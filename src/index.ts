import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import "dotenv/config";
import { SkyHelper } from "#structures";
import { initializeMongoose } from "#src/database/mongoose";
const client = new SkyHelper();
import { Dashboard } from "../dashboard/main.js";
import chalk from "chalk";

declare global {
  namespace NodeJS {
    interface Process {
      isBun?: boolean;
    }
    interface ProcessEnv {
      TOKEN: string;
      NODE_ENV: "development" | "production";
      MONGO_CONNECTION: string;
      SENTRY_DSN: string;
      AUTH_TOKEN: string;
      TOPGG_TOKEN?: string;
      GUILD?: string;
      ERROR_LOGS?: string;
      READY_LOGS?: string;
      SUGGESTION?: string;
      CONTACT_US?: string;
      COMMANDS_USED?: string;
      BUG_REPORTS?: string;
    }
  }
}
// Init Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    nodeProfilingIntegration(),
    Sentry.rewriteFramesIntegration({
      root: global.__dirname,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions

  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

const root = process.isBun ? "src" : "dist/src";
await client.loadEvents(root + "/events");
await client.loadSlashCmd(root + "/commands/slash");
await client.loadContextCmd(root + "/commands/contexts");
await client.loadButtons(root + "/buttons");
await client.loadPrefix(root + "/commands/prefix");
await initializeMongoose();
console.log(chalk.blueBright("\n\n<------------------------ Dashboard --------------------------->\n"));
if (client.config.DASHBOARD.enabled) Dashboard(client);
// Catching unhandle rejections
process.on("unhandledRejection", (err) => {
  client.logger.error(err);
});
process.on("uncaughtException", (err) => client.logger.error(err));
// Login
client.login(process.env.TOKEN);
