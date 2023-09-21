const fs = require('fs');
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const moment = require('moment-timezone');
const eventSequence = ['C', 'b', 'A', 'a', 'B', 'b', 'C', 'a', 'A', 'b', 'B', 'a'];
const secondEventSequence = ['prairie', 'forest', 'valley', 'wasteland', 'vault'];

const shardData = require('./sub/LocationData')

const MAX_SHARD_INDEX = 1; // Two results for each event, so the max shard index is 1
let currentShardIndex = 0;
let originalEmbedData = null;
let originalActionRow = null;

const timezone = 'America/Los_Angeles';

async function shardLocation(interaction, Gale, Clement) {
  if (!interaction.customId.includes('shard')) return
     const messageId = interaction.message.id;
     const currentDate = getCurrentDate(interaction, messageId);
    if (!currentDate) return;
    const dayOfMonth = currentDate.date();
    const sequenceIndex = (dayOfMonth - 1) % eventSequence.length;
    const currentEvent = eventSequence[sequenceIndex];
    const secondSequenceIndex = (dayOfMonth - 1) % secondEventSequence.length;
    const currentSecondEvent = secondEventSequence[secondSequenceIndex];
  if (interaction.customId === 'shard_location') { 
        currentShardIndex = 0;
        originalEmbedData = interaction.message.embeds[0];
        originalActionRow = interaction.message.components?.[0];
        await saveOriginalData(messageId, originalEmbedData, originalActionRow);
        await showShard(interaction, shardData[currentSecondEvent][currentEvent][currentShardIndex], Gale, Clement);
  } else if (interaction.customId === 'shard_leftL') {
        currentShardIndex = Math.max(currentShardIndex - 1, 0);
        await showShard(interaction, shardData[currentSecondEvent][currentEvent][currentShardIndex], Gale, Clement);
    } else if (interaction.customId === 'shard_rightL') {
        currentShardIndex = Math.min(currentShardIndex + 1, MAX_SHARD_INDEX);
        await showShard(interaction, shardData[currentSecondEvent][currentEvent][currentShardIndex], Gale, Clement);
    } else if (interaction.customId === 'shard_originalL') {
      const restoredData = restoreOriginalData(interaction.message.id);
      if (restoredData) {
          await interaction.update({ embeds: [restoredData.originalEmbedData], components: [restoredData.originalActionRow] });
      
    }
}
}



function getCurrentDate(interaction, messageId) {
  const filePath = 'messageData.json';

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const messageData = JSON.parse(data);
    const message = messageData.find((data) => data.messageId === messageId);

    if (!message) {
      interaction.reply({ content: 'No dates found for this message. The interaction might be expired, please run the command again', ephemeral: true});
      return false;
    }

    const dateOption = message.time;

    let currentDate;
    if (dateOption) {
      currentDate = moment.tz(dateOption, 'Y-MM-DD', timezone).startOf('day');
      if (!currentDate.isValid()) {
        console.log(`${dateOption} does not exist, please provide a valid date.`);
        return null;
      }
    } else {
      currentDate = moment.tz(timezone).startOf('day');
    }

    return currentDate;
  } catch (error) {
    console.error('Error reading messageData.json:', error);
  }
}

async function showShard(interaction, shard, Gale, Clement) {
      const clementIcon = Clement.avatarURL({ format: 'png', size: 2048 });
  const galeIcon = Gale.avatarURL({ format: 'png', size: 2048 });

  // Assuming currentShardIndex and MAX_SHARD_INDEX are defined somewhere in your code


  const authorName = currentShardIndex === 0 ? `Shard location by Clement  (${Clement.username})` : `Shard data by Gale (${Gale.username})`;
  const authorIcon = currentShardIndex === 0 ? clementIcon : galeIcon;

    const shardEmbed = {
        title: shard.title,
        description: shard.description,
        color: parseInt('00ff00', 16),
        footer: { text: `Page ${currentShardIndex + 1} of ${MAX_SHARD_INDEX + 1} | Sky Shards Information`, icon_url: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' },
        author: {
      name: authorName,
      icon_url: authorIcon,
    },
    image: {
            url: shard.image
        },
    };

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Location')
                .setCustomId('shard_leftL')
                .setStyle('1'),
            new ButtonBuilder()
                .setLabel('Data')
                .setCustomId('shard_rightL')
                .setStyle('1'),
            new ButtonBuilder()
                .setEmoji('<a:back:1148653107773976576>')
                .setCustomId('shard_originalL')
                .setStyle(3)
        );

    // Disable navigation buttons if the current shard is the first or last
    if (currentShardIndex === 0) {
        actionRow.components[0].setDisabled(true);
    }
    if (currentShardIndex === MAX_SHARD_INDEX) {
        actionRow.components[1].setDisabled(true);
    }

    await interaction.update({ embeds: [shardEmbed], components: [actionRow] });
}

function saveOriginalData(messageId, originalEmbedData, originalActionRow) {
  try {
      const filePath = 'embedData.json';
      const data = fs.readFileSync(filePath, 'utf8');
      const embedData = JSON.parse(data);

      if (!embedData[messageId]) {
          embedData[messageId] = {
              originalEmbedData,
              originalActionRow
          };

          fs.writeFileSync(filePath, JSON.stringify(embedData, null, 2), 'utf8');
      }
  } catch (error) {
      console.error('Error saving original data:', error);
  }
}
function restoreOriginalData(messageId) {
  try {
      const filePath = 'embedData.json';
      const data = fs.readFileSync(filePath, 'utf8');
      const embedData = JSON.parse(data);

      if (embedData[messageId]) {
          return embedData[messageId];
      }
  } catch (error) {
      console.error('Error restoring original data:', error);
  }
  
  return null;
}
module.exports = {
    shardLocation, saveOriginalData, restoreOriginalData, getCurrentDate
};
