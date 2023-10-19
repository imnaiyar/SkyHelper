const fs = require('fs');
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const moment = require('moment-timezone');
const { getCurrentDate } = require('@shards/shardsLocation');
const eventSequence = [
  'C',
  'b',
  'A',
  'a',
  'B',
  'b',
  'C',
  'a',
  'A',
  'b',
  'B',
  'a',
]; // Remove the repeating part
const secondEventSequence = [
  'prairie',
  'forest',
  'valley',
  'wasteland',
  'vault',
];
const { nextPrev } = require('./sub/scrollFunc');
const shardData = require('./sub/timelineData');

const MAX_SHARD_INDEX = 2; // 3 results for each event, so the max shard index is 2
let currentShardIndex = 0;
let originalEmbedData = null;
let originalActionRow = null;
let buttonDisableTimeout = null;

const timezone = 'America/Los_Angeles';

async function shardTimeline(interaction, Zhii, Christian) {
  if (!interaction.customId.includes('shard')) return;
  const messageId = interaction.message.id; // Get the messageId of the current interaction
  const currentDate = getCurrentDate(interaction, messageId);
  if (!currentDate) return;
  const dayOfMonth = currentDate.date();
  const sequenceIndex = (dayOfMonth - 1) % eventSequence.length;
  const currentEvent = eventSequence[sequenceIndex];
  if (interaction.customId === 'shard_timeline') {
    currentShardIndex = 0;
    await showShard(
      interaction,
      shardData[currentEvent][currentShardIndex],
      Zhii,
      Christian,
    );
  } else if (interaction.customId === 'shard_left') {
    currentShardIndex = Math.max(currentShardIndex - 1, 0);
    await showShard(
      interaction,
      shardData[currentEvent][currentShardIndex],
      Zhii,
      Christian,
    );
  } else if (interaction.customId === 'shard_right') {
    currentShardIndex = Math.min(currentShardIndex + 1, MAX_SHARD_INDEX);
    await showShard(
      interaction,
      shardData[currentEvent][currentShardIndex],
      Zhii,
      Christian,
    );
  } else if (interaction.customId === 'shard_original') {
    await nextPrev(interaction);
  }
}

async function showShard(interaction, shard, Zhii, Christian) {
  const avatarURL1 = Zhii.avatarURL({ format: 'png', size: 2048 });
  const avatarURL2 = Christian.avatarURL({ format: 'png', size: 2048 });
  const shardEmbed = {
    title: shard.title,
    description: shard.description,
    color: parseInt('00ff00', 16),
    footer: {
      text: `Sky changes and Shard music by Christian(${
        Christian.username
      }) | Page ${currentShardIndex + 1} of ${MAX_SHARD_INDEX + 1}`,
      icon_url: `${avatarURL2}`,
    },
    fields: [
      {
        name: 'Early Sky Change',
        value: shard.earlySky,
      },
      {
        name: 'Gate Shard',
        value: shard.gateShard,
      },
      {
        name: 'Shard Landing',
        value: shard.shardLand,
      },
      {
        name: 'End of Shard',
        value: shard.shardEnd,
      },
      {
        name: 'Shard Music',
        value: shard.shardMusic,
      },
    ],
    author: {
      name: `Shards Timestamp by Zhii(${Zhii.username})`,
      icon_url: `${avatarURL1}`,
    },
  };

  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setEmoji('<a:left:1148644073670975640>')
      .setCustomId('shard_left')
      .setStyle('1'),
    new ButtonBuilder()
      .setEmoji('<a:right:1148627450608222278>')
      .setCustomId('shard_right')
      .setStyle('1'),
    new ButtonBuilder()
      .setEmoji('<a:back:1148653107773976576>')
      .setCustomId('shard_original')
      .setStyle(3)
      .setDisabled(false),
  );
  if (currentShardIndex === 0) {
    actionRow.components[0].setDisabled(true);
  }
  if (currentShardIndex === MAX_SHARD_INDEX) {
    actionRow.components[1].setDisabled(true);
  }
  await interaction.update({ embeds: [shardEmbed], components: [actionRow] });
}

module.exports = {
  shardTimeline,
};
