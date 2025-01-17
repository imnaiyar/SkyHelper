import { CustomLogger } from "@imnaiyar/framework";
import { captureException, Scope } from "@sentry/node";
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

  /**
   * @param err
   * @param [scope=new Scope()]
   */
  static error(err: any, scope: Scope): string;

  /**
   * @param content
   * @param ex
   * @param [scope=new Scope()]
   * @returns The error ID
   */
  static error(content: any, ex?: any, scope?: Scope): string;
  /**
   * @param content
   * @param ex
   * @returns The error ID
   */
  static error(content: any, err?: any, scope: Scope = new Scope()) {
    const ex = err instanceof Scope ? undefined : err;
    const sentryScope = err instanceof Scope ? err : scope;
    const id = captureException(ex || content, sentryScope);
    if (ex) {
      logger.error(content, ex, id);
    } else {
      logger.error(content, id);
    }
    if (process.env.NODE_ENV === "development") console.error(content, ex);
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
