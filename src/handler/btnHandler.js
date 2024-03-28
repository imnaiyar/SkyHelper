const d = require("discord.js");
const { shardLocation, shardTimeline, shardInfos, nextPrev } = require("@functions/shards");

/**
 * Handler for button interactions.
 * @param {import('discord.js').ButtonInteraction} interaction
 */
module.exports = async (interaction) => {
  if (!interaction.isButton()) return;
  const { client } = interaction;

  if (interaction.customId === "next" || interaction.customId === "prev") {
    const value = interaction.customId;
    await nextPrev(interaction, value);
  }
};
