import "dotenv/config";
import { SkyHelper } from "#structures";
import { initializeMongoose } from "#src/database/mongoose";
const client = new SkyHelper();
import { Dashboard } from "../dashboard/main.js";
import chalk from "chalk";

// Init Sentry
if (!process.isBun) {
  console.log(chalk.blueBright("\n\n<------------------------ Initiaizing Sentry --------------------------->\n"));
  const Sentry = await import("@sentry/node");
  const { nodeProfilingIntegration } = await import("@sentry/profiling-node");
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      nodeProfilingIntegration(),
      Sentry.rewriteFramesIntegration({
        root: global.__dirname,
      }),
    ],
    environment: process.env.NODE_ENV,

    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
  console.log("Sentry Initialized");
}

const root = process.isBun ? "src" : "dist/src";
await client.loadEvents(root + "/events");
await client.loadSlashCmd(root + "/commands/slash");
await client.loadContextCmd(root + "/commands/contexts");
await client.loadButtons(root + "/buttons");
await client.loadPrefix(root + "/commands/prefix");
await initializeMongoose();
console.log(chalk.blueBright("\n\n<------------------------ Dashboard --------------------------->\n"));
if (client.config.DASHBOARD.enabled && process.env.NODE_ENV !== "development") Dashboard(client);
// Catching unhandle rejections
process.on("unhandledRejection", client.logger.error);
process.on("uncaughtException", client.logger.error);
// Login
client.login(process.env.TOKEN);

