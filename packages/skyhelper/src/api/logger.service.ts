import { Injectable, type LoggerService } from "@nestjs/common";
import logger from "@/handlers/logger";
@Injectable()
export class Logger implements LoggerService {
  log(message: string, ...optionalParams: any[]) {
    logger.custom(message, optionalParams.pop());
  }

  error(message: string, trace: string) {
    logger.error(message, trace);
  }

  warn(message: string, ...optionalParams: any[]) {
    logger.warn(message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    logger.debug(message, ...optionalParams);
  }
}
