/**
 * Client error event handler
 * @param {import('@src/structures').SkyHelper} client - Bot's client instance
 * @param {import('discord.js').ErrorEvent} err - The error object
 * @returns {void}
 */
module.exports = (client, err) => {
  client.logger.error(`Client Error:`, err);
};
