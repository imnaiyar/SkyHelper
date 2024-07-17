import cron from "node-cron";
import type { JobOptions } from "#libs";
import * as Sentry from "@sentry/node";
const cronWithCheckIn = Sentry.cron.instrumentNodeCron(cron);
/**
 * Class to create cron jobs for scheduled events
 */
export default class {
  constructor(private options: JobOptions) {
    this.options = options;
    this.create();
  }
  /**
   * Creates a cron job
   */
  create() {
    return cronWithCheckIn.schedule(this.options.interval, this.options.callback, this.options.options);
  }
}
