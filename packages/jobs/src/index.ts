import "./instrument.js";
import "./validate-env.js";
import * as Sentry from "@sentry/bun";
import { initializeMongoose } from "@/database/connect.js";
import { reminderSchedules } from "@/functions/sendReminders.js";
import { eventSchedules } from "@/functions/updateShardOrTimes.js";
import { logger } from "./structures/Logger.js";
import cron from "node-cron";
await initializeMongoose();
const CronJob = Sentry.cron.instrumentNodeCron(cron);
// SkyTimes
CronJob.schedule(
  "*/2 * * * *",
  () => {
    eventSchedules("times").catch((err) => logger.error("SkyTimes Job Error: ", err));
    logger.info("Ran SkyTimes Job");
  },
  { name: "SkyTimes" },
);

// Shards job
CronJob.schedule(
  "*/5 * * * *",
  () => {
    eventSchedules("shard").catch((err) => {
      const id = Sentry.captureException(err);
      logger.error("Shards Job Error: ", err, id);
    });
    logger.info("Ran Shards Job");
  },
  { name: "Shards" },
);

CronJob.schedule(
  "*/1 * * * *",
  () => {
    reminderSchedules().catch((err) => {
      const id = Sentry.captureException(err);
      logger.error("Reminders Job Error: ", err, id);
    });
    logger.info("Ran Reminders Job");
  },
  { name: "Reminders", timezone: "America/Los_Angeles" },
);

logger.info("Logged in and Jobs have been started");

// Catch any unknown errors
process.on("uncaughtException", logger.error.bind(logger));
process.on("unhandledRejection", logger.error.bind(logger));
