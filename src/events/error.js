/**
 * Client error event handler
 * @param {import('@src/frameworks').SkyHelper} client - Bot's client instance
 * @param {import('discord.js').ErrorEvent} err - The error object
 * @returns {void}
 */
export default (client, err) => {
  client.logger.error(`Client Error:`, err);
};
