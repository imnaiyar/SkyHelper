/**
 * messageReactionAdd event handler
 * @param {import('@src/structures').SkyHelper} client
 * @param {import('discord.js').MessageReaction|import('discord.js').PartialMessageReaction} reaction
 * @param {import('discord.js').User|import('discord.js').PartialUser} user
 */

module.exports = async (client, reaction, user) => {
  return { reaction, user };
};
