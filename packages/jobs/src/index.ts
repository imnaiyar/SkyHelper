import { logger } from "./structures/Logger.js";
import { checkAndExecuteEvents } from "./functions/testRemindersWithOffset.js";

import cron from "node-cron";

// schedule reminders to run everyminute
cron.schedule(
  "*/1 * * * *",
  async () => {
    checkAndExecuteEvents();
  },
  { name: "Reminders Job" },
);

logger.info("Logged in and Jobs have been started");

// Catch any unknown errors
process.on("uncaughtException", logger.error);
process.on("unhandledRejection", logger.error);
