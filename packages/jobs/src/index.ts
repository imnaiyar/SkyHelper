import "./validate-env.js";
import { initializeMongoose } from "@/database/connect.js";
import { reminderSchedules } from "@/functions/sendReminders.js";
import { eventSchedules } from "@/functions/updateShardOrTimes.js";
import { logger } from "./structures/Logger.js";
import cron from "node-cron";
await initializeMongoose();
// SkyTimes
cron.schedule(
  "*/2 * * * *",
  () => {
    eventSchedules("times").catch((err) => logger.error("SkyTimes Job Error: ", err));
    logger.info("Ran SkyTimes Job");
  },
  { name: "SkyTimes Job" },
);

// Shards job
cron.schedule(
  "*/5 * * * *",
  () => {
    eventSchedules("shard").catch((err) => logger.error("Shards Job Error: ", err));
    logger.info("Ran Shards Job");
  },
  { name: "Shards Job" },
);

cron.schedule(
  "*/1 * * * *",
  () => {
    reminderSchedules().catch((err) => logger.error("Reminders Job Error: ", err));
    logger.info("Ran Reminders Job");
  },
  { name: "Reminders Job", timezone: "America/Los_Angeles" },
);

logger.info("Logged in and Jobs have been started");

// Catch any unknown errors
process.on("uncaughtException", logger.error.bind(logger));
process.on("unhandledRejection", logger.error.bind(logger));
