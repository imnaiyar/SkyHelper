const { success, error, warn } = require("@src/logger");
const fs = require("fs");
const util = require("util");
const config = require("@root/config");
const chalk = require("chalk");
module.exports = {
  /**
   * Validates environment variables
   * @returns {Boolean}
   */
  validations: async () => {
    if (!process.env.TOKEN) {
      error(`env: "TOKEN" cannot be empty.`);
      return false;
    } else {
      success(`env: ${chalk.bold.white("✔")} "TOKEN" validated.`);
    }

    if (!process.env.MONGO_CONNECTION) {
      error(`env: "MONGO_CONNECTION" cannot be empty.`);
      return false;
    } else {
      success(`env: ${chalk.bold.white("✔")} "MONGO_CONNECTION" validated.`);
    }

    if (!process.env.CLIENT_ID) {
      error(`env: "CLIENT_ID" cannot be empty`);
      return false;
    } else {
      success(`env: ${chalk.bold.white("✔")} Client ID validated.`);
    }

    if (config.DASHBOARD.enabled && !process.env.AUTH_TOKEN) {
      error(`env: "AUTH_TOKEN" cannot is empty, contact form on website won't work.`);
      return false;
    } else {
      success(`env: ${chalk.bold.white("✔")} "AUTH_TOKEN" validated.`);
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

    return true;
  },
};
