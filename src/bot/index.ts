import { SkyHelper } from "#structures";
import { initializeMongoose } from "#bot/database/mongoose";
const client = new SkyHelper();
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

import chalk from "chalk";
import { validateEnv } from "./utils/validators.js";
import { CustomLogger } from "./handlers/logger.js";

// validate env
console.log(chalk.blueBright(`\n\n<${"-".repeat(26)} Validating Env ${"-".repeat(26)}>\n`));
try {
  validateEnv();
} catch (e: any) {
  CustomLogger.log({ level: { name: "ERROR", emoji: "☠", color: "\x1b[31m" } }, e.message);
  process.exit(1);
}

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

console.log("\n\n");
CustomLogger.log({ level: { name: "Sentry", color: "\x1b[36m" } }, "Sentry Initialized\n\n\n");
await client.loadModules();
await initializeMongoose();

// Catching unhandle rejections
process.on("unhandledRejection", client.logger.error);
process.on("uncaughtException", client.logger.error);
// Login
client.login(process.env.TOKEN);
