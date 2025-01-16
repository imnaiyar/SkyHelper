import { CustomLogger } from "@imnaiyar/framework";

const logger = new CustomLogger({
  errorWebhook: process.env.ERROR_WEBHOOK,
  singleLineError: process.env.NODE_ENV === "production",
  timezone: "Asia/Kolkata",
  timestamp: true,
  env: process.env.NODE_ENV,
  logToFile: true,
});
export { logger };
