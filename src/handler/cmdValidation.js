import { error } from '@src/logger';
import chalk from 'chalk';

export default {
  /**
   * @param {import('@src/frameworks').SlashCommands} cmd
   * @param {string} file
   * @returns {Boolean}
   */
  cmdValidation: (cmd, file) => {
    if (typeof cmd !== "object") return false;
    if (!cmd.data) return false;

    if (!cmd.execute) {
      error(`
         ${chalk.yellow(`[${file}]:`)} Command missing an "execute" function. Skipping...`);
      return false;
    }

    if (cmd.data.name !== cmd.data.name.toLowerCase()) {
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
