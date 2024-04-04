import d from 'discord.js';
import { shardLocation, shardTimeline, shardInfos, nextPrev } from '@functions/shards';

/**
 * Handler for button interactions.
 * @param {import('discord.js').ButtonInteraction} interaction
 */
export default async (interaction) => {
  if (!interaction.isButton()) return;
  const { client } = interaction;

  if (interaction.customId === "next" || interaction.customId === "prev") {
    const value = interaction.customId;
    await nextPrev(interaction, value);
  }
};
