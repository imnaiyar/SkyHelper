import { CustomLogger } from "@imnaiyar/framework";
import { captureException, Scope } from "@sentry/node";
const logger = new CustomLogger({
  env: process.env.NODE_ENV as "development",
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
    if (message) logger.info(content, message);
    else logger.info(content);
  }

  /**
   * @param content
   */
  static log(content: string, message?: string) {
    if (message) logger.info(content, message);
    else logger.info(content);
  }

  /**
   * @param content
   */
  static warn(content: string, message?: string) {
    if (message) logger.warn(content, message);
    else logger.warn(content);
  }

  static error(content: any, err?: any): string;
  static error(content: any, err?: any, scope?: Scope): string;
  static error(content: any, scope: Scope): string;
  /**
   * @param content
   * @param ex
   * @returns The error ID
   */
  static error(content: any, err?: any | Scope, scope?: Scope): string {
    const scop = err instanceof Scope ? err : scope;
    const error = err instanceof Scope ? undefined : err;
    const id = captureException(error || content, scop);
    if (error) {
      logger.error(content, error, id);
    } else {
      logger.error(content, id);
    }
    if (process.env.NODE_ENV === "development") console.error(content, error);
    return id;
  }

  /**
   * @param content
   */
  static debug(...content: any[]) {
    logger.debug(...content);
  }

  static custom(content: string, type: string) {
    logger.log({ level: { name: type, color: "\x1b[36m" } }, content);
  }
}
export { logger as CustomLogger };
