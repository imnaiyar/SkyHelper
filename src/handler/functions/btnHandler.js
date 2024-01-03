const { shardInfos } = require('@shards/aboutShards');
const d = require('discord.js');
const { shardLocation } = require('@shards/shardsLocation');
const { shardTimeline } = require('@shards/shardsTimeline');
const { nextPrev } = require('@shards/sub/scrollFunc');
module.exports = async (interaction) => {
  if (!interaction.isButton()) return;
  const { client } = interaction;
  const Art = await client.users.fetch('504605855539265537');
  const Zhii = await client.users.fetch('650487047160725508');
  const Gale = await client.users.fetch('473761854175576075');
  const Clement = await client.users.fetch('693802004018888714');
  const Christian = await client.users.fetch('594485678625128466');

  if (interaction.customId === 'error_report') {
    const modal = new d.ModalBuilder()
      .setCustomId('errorModal')
      .setTitle('Bug Report');

    const commandUsed = new d.TextInputBuilder()
      .setCustomId('commandUsed')
      .setLabel('Name of the command.')
      .setPlaceholder('The command that produced the said error.')
      .setStyle(d.TextInputStyle.Short);

    const whatHappened = new d.TextInputBuilder()
      .setCustomId('whatHappened')
      .setLabel('Explain what happened?')
      .setStyle(d.TextInputStyle.Paragraph)
      .setPlaceholder(
        'Explain in brief what happened. What outcome were you hoping?',
      );

    const firstActionRow = new d.ActionRowBuilder().addComponents(commandUsed);
    const secondActionRow = new d.ActionRowBuilder().addComponents(
      whatHappened,
    );

    modal.addComponents(firstActionRow, secondActionRow);

    await interaction.showModal(modal);
  }
  if (interaction.customId === 'next' || interaction.customId === 'prev') {
    const value = interaction.customId;
    await nextPrev(interaction, value);
  }
  if (interaction.customId.startsWith('timeline')) {
    shardTimeline(interaction, Zhii, Christian);
  }
  if (interaction.customId.startsWith('location')) {
    shardLocation(interaction, Gale, Clement);
  }
  if (interaction.customId.startsWith('about')) {
    shardInfos(interaction, Art);
  }
};
