const { error } = require('@src/logger');
const chalk = require('chalk');
module.exports = {
  cmdValidation: async (cmd, file) => {
    if (!cmd.data) {
      error(`
         ${chalk.yellow(
           `[${file}]:`,
         )} This command doesn't contain a valid "data" object. Skipping..`);
      return false;
    }

    if (!cmd.execute) {
      error(`
         ${chalk.yellow(
           `[${file}]:`,
         )} Command missing an "execute" function. Skipping...`);
      return false;
    }

    if (cmd.data && cmd.data.name !== cmd.data.name.toLowerCase()) {
      error(`
         ${chalk.yellow(`[${file}]:`)}
          Command name must be lowercase. Skipping..`);
      return false;
    }
    if (!cmd.data.description) {
      error(`
         ${chalk.yellow(`[${file}]:`)}
          Command must contain a description. Skipping..`);
    }
    return true;
  },
};
