import { initializeMongoose } from "@/database/connect.js";
import { reminderSchedules } from "@/functions/sendReminders.js";
import { eventSchedules } from "@/functions/updateShardOrTimes.js";
import { logger } from "./structures/Logger.js";
import cron from "node-cron";
await initializeMongoose();
// SkyTimes
cron.schedule(
  "*/2 * * * *",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async () => {
    try {
      await eventSchedules("times");
      logger.info("Ran SkyTimes Job");
    } catch (err) {
      logger.error("SkyTimes Job Error: ", err);
    }
  },
  { name: "SkyTimes Job" },
);

// Shards job
cron.schedule(
  "*/5 * * * *",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async () => {
    try {
      await eventSchedules("shard");
      logger.info("Ran Shards Job");
    } catch (err) {
      logger.error("Shards Job Error: ", err);
    }
  },
  { name: "Shards Job" },
);

cron.schedule(
  "*/1 * * * *",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async () => {
    try {
      await reminderSchedules();
      logger.info("Ran Reminders Job");
    } catch (err) {
      logger.error("Reminders Job Error: ", err);
    }
  },
  { name: "Reminders Job", timezone: "America/Los_Angeles" },
);

logger.info("Logged in and Jobs have been started");

// Catch any unknown errors
// eslint-disable-next-line @typescript-eslint/unbound-method
process.on("uncaughtException", logger.error);
// eslint-disable-next-line @typescript-eslint/unbound-method
process.on("unhandledRejection", logger.error);
