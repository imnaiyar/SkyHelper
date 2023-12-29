const { success, error, warn } = require('@src/logger');
const fs = require('fs');
const util = require('util');
const config = require('@root/config');
const chalk = require('chalk');
module.exports = {
  validations: async () => {
    if (!process.env.TOKEN) {
      error(`"TOKEN" cannot be empty.`);
      return false;
    } else {
      success(`${chalk.bold.white('✔')} Token validated.`);
    }

    if (!process.env.MONGO_CONNECTION) {
      error(`"MONGO_CONNECTION" cannot be empty.`);
      return false;
    } else {
      success(`${chalk.bold.white('✔')} MongoDB URL validated.`);
    }

    if (!process.env.CLIENT_ID) {
      error(`"CLIENT_ID" cannot be empty`);
      return false;
    } else {
      success(`${chalk.bold.white('✔')} Client ID validated.`);
    }

    if (!process.env.BOT_PREFIX) {
      error(`"BOT_PREFIX" cannot be empty.`);
      return false;
    } else {
      success(`${chalk.bold.white('✔')} Bot Prefix validated.`);
    }

    if (!process.env.TOPGG_TOKEN) {
      warn('TopGG Token is not provided, TopggAutopost will not work');
    }

    if (!config.DASHBOARD.enabled) {
      warn("Dashboard is disabled, enable it to deploy the bot's website.");
    }

    if (!process.env.SUGGESTION) {
      warn(
        '"SUGGESTION" webhook URL is not provided, suggestion command wont work properly',
      );
    }
    const access = util.promisify(fs.access);
    try {
      await access('messageData.json', fs.constants.F_OK);
    } catch (err) {
      error(
        `"messageData.json" file does not exist in the root directory, "shards" related commands will not work properly`,
      );
      return false;
    }

    return true;
  },
};
