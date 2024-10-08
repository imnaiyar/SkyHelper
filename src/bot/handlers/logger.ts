import { CustomLogger } from "@imnaiyar/framework";
import { captureException } from "@sentry/node";
const logger = new CustomLogger({
  env: process.env.NODE_ENV,
  errorWebhook: process.env.ERROR_LOGS,
  logToFile: true,
  timestamp: true,
  timezone: "Asia/Kolkata",
  singleLineError: process.env.NODE_ENV === "production",
});

/**
 * Custom logger
 */
export default class {
  /**
   * @param content
   */
  static success(content: string, message?: string) {
    logger.info(content, message);
  }

  /**
   * @param content
   */
  static log(content: string, message?: string) {
    logger.info(content, message);
  }

  /**
   * @param content
   */
  static warn(content: string, message: string) {
    logger.warn(content, message);
  }

  /**
   * @param content
   * @param ex
   * @returns The error ID
   */
  static error(content: any, ex?: any) {
    const id = captureException(ex || content);
    if (ex) {
      logger.error(content, ex, id);
    } else {
      logger.error(content, id);
    }
    if (process.isBun) console.error(content, ex);
    return id;
  }

  /**
   * @param content
   */
  static debug(content: string) {
    logger.debug(content);
  }

  static custom(content: string, type: string) {
    logger.log({ level: { name: type, color: "\x1b[36m" } }, content);
  }
}
export { logger as CustomLogger };
