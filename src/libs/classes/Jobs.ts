import cron from "node-cron";
import { JobOptions } from "#libs";
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
    return cron.schedule(this.options.interval, this.options.callback, this.options.options);
  }
}
