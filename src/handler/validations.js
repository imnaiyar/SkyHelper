import { log, error, warn } from '../logger.js';
import fs from 'fs';
import util from 'util';
import config from '@root/config';
import chalk from 'chalk';

export default {
  /**
   * Validates environment variables
   * @returns {Boolean}
   */
  validations: () => {
    if (!process.env.TOKEN) {
      error(`env: "TOKEN" cannot be empty.`);
      process.exit(1);
    } else {
      log(`env: ${chalk.bold.white("✔")} "TOKEN" validated.`);
    }

    if (!process.env.MONGO_CONNECTION) {
      error(`env: "MONGO_CONNECTION" cannot be empty.`);
      process.exit(1);
    } else {
      log(`env: ${chalk.bold.white("✔")} "MONGO_CONNECTION" validated.`);
    }

    if (config.DASHBOARD.enabled && !process.env.AUTH_TOKEN) {
      error(`env: "AUTH_TOKEN" cannot is empty, contact form on website won't work.`);
      process.exit(1);
    } else {
      log(`env: ${chalk.bold.white("✔")} "AUTH_TOKEN" validated.`);
    }

    if (!process.env.TOPGG_TOKEN) {
      warn("env: TopGG Token is not provided, TopggAutopost will not work");
    }

    if (!config.DASHBOARD.enabled) {
      warn("env: Dashboard is disabled, enable it to deploy the bot's website.");
    }

    if (!process.env.SUGGESTION) {
      warn('env: "SUGGESTION" webhook URL is not provided, suggestion command wont work properly');
    }
  },
};
