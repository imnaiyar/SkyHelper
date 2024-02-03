/**
 * @param {import('@root/main')} client - Bot's client instance
 * @param {import('discord.js').error} err - The error object
 * @returns {void}
 */
module.exports = (client, err) => {
  client.logger.error(`Client Error:`, err);
};
