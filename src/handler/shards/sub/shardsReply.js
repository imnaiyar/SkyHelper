const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const Logger = require('@src/logger');
const fs = require('fs');
const moment = require('moment');

async function shardsReply(
  interaction,
  currentDate,
  formatDate,
  eventStatus,
  timeRemaining,
  currentEvent,
  currentSecondEvent,
  dayOfWeek,
  noShard,
) {
  const timezone = 'America/Los_Angeles';
  const messageDataFile = 'messageData.json';
  let type = 'Red Shard';
  let location;
  let rewards;
  let colors = '#FF0000';
  let showButtons = true;

  let result = new EmbedBuilder()
    .setAuthor({
      name: `Shards Information for ${noShard}`,
      iconURL:
        'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925',
    })
    .setTimestamp(Date.now())
    .setFooter({
      text: 'SkyHelper',
      iconURL: interaction.client.user.displayAvatarURL(),
    });

  if (currentSecondEvent === 'prairie') {
    if (currentEvent === 'a' && ![6, 0].includes(dayOfWeek)) {
      type = 'Black Shard';
      location = `Butterfly Fields, Daylight Prairie`;
      colors = '#000000';
      rewards = '200 Wax <:wax:1125091974869946369>';
    } else if (currentEvent === 'A' && ![2, 3].includes(dayOfWeek)) {
      location = `Bird's Nest, Daylight Prairie`;
      rewards = '2.5 AC <a:ac5:1125338720183267390>';
    } else if (currentEvent === 'b' && ![0, 1].includes(dayOfWeek)) {
      type = 'Black Shard';
      colors = '#000000';
      location = 'Village Island, Daylight Prairie';
      rewards = '200 Wax <:wax:1125091974869946369>';
    } else if (currentEvent === 'B' && ![3, 4].includes(dayOfWeek)) {
      location = ' Sanctuary Island, Daylight Prairie';
      rewards = '3.5 AC <a:ac5:1125338720183267390>';
    } else if (currentEvent === 'C' && ![1, 2].includes(dayOfWeek)) {
      location = 'Prairie Caves, Daylight Prairie';
      rewards = '2 AC <a:ac5:1125338720183267390>';
    } else {
      showButtons = false;
    }
  } else if (currentSecondEvent === 'forest') {
    if (currentEvent === 'a' && ![6, 0].includes(dayOfWeek)) {
      type = 'Black Shard';
      location = 'Forest Brook, Hidden Forest';
      colors = '#000000';
      rewards = '200 Wax <:wax:1125091974869946369>';
    } else if (currentEvent === 'A' && ![2, 3].includes(dayOfWeek)) {
      location = 'Treehouse, Hidden Forest';
      rewards = '3.5 AC <a:ac5:1125338720183267390>';
    } else if (currentEvent === 'b' && ![0, 1].includes(dayOfWeek)) {
      type = 'Black Shard';
      location = 'Boneyard, Hidden Forest';
      colors = '#000000';
      rewards = '200 Wax <:wax:1125091974869946369>';
    } else if (currentEvent === 'B' && ![3, 4].includes(dayOfWeek)) {
      location = 'Sunny Forest, Hidden Forest';
      rewards = '3.5 AC <a:ac5:1125338720183267390>';
    } else if (currentEvent === 'C' && ![1, 2].includes(dayOfWeek)) {
      location = 'Forest End, Hidden Forest';
      rewards = '2.5 AC <a:ac5:1125338720183267390>';
    } else {
      showButtons = false;
    }
  } else if (currentSecondEvent === 'valley') {
    if (currentEvent === 'a' && ![6, 0].includes(dayOfWeek)) {
      type = 'Black Shard';
      location = 'Ice Rink, Valley of Triumph';
      colors = '#000000';
      rewards = '200 Wax <:wax:1125091974869946369>';
    } else if (currentEvent === 'A' && ![2, 3].includes(dayOfWeek)) {
      location = 'Village of Dreams, Valley of Triumph';
      rewards = '2.5 AC <a:ac5:1125338720183267390>';
    } else if (currentEvent === 'b' && ![0, 1].includes(dayOfWeek)) {
      type = 'Black Shard';
      location = 'Ice Rink, Valley of Triumph';
      colors = '#000000';
      rewards = '200 Wax <:wax:1125091974869946369>';
    } else if (currentEvent === 'B' && ![3, 4].includes(dayOfWeek)) {
      location = `Hermit's Valley, Valley of Triumph`;
      rewards = '3.5 AC <a:ac5:1125338720183267390>';
    } else if (currentEvent === 'C' && ![1, 2].includes(dayOfWeek)) {
      location = 'Village of Dreams, Valley of Triumph';
      rewards = '2.5 AC <a:ac5:1125338720183267390>';
    } else {
      showButtons = false;
    }
  } else if (currentSecondEvent === 'wasteland') {
    if (currentEvent === 'a' && ![6, 0].includes(dayOfWeek)) {
      type = 'Black Shard';
      location = 'Broken Temple, Golden Wasteland';
      colors = '#000000';
      rewards = '200 Wax <:wax:1125091974869946369>';
    } else if (currentEvent === 'A' && ![2, 3].includes(dayOfWeek)) {
      location = 'Crab Fields, Golden Wasteland';
      rewards = '2.5 AC <a:ac5:1125338720183267390>';
    } else if (currentEvent === 'b' && ![0, 1].includes(dayOfWeek)) {
      location = 'Battlefield, Golden Wasteland';
      type = 'Black Shard';
      colors = '#000000';
      rewards = '200 Wax <:wax:1125091974869946369>';
    } else if (currentEvent === 'B' && ![3, 4].includes(dayOfWeek)) {
      location = 'Forgotten Ark, Golden Wasteland';
      rewards = '3.5 AC <a:ac5:1125338720183267390>';
    } else if (currentEvent === 'C' && ![1, 2].includes(dayOfWeek)) {
      location = 'Graveyard, Golden Wasteland';
      rewards = '2 AC <a:ac5:1125338720183267390>';
    } else {
      showButtons = false;
    }
  } else if (currentSecondEvent === 'vault') {
    if (currentEvent === 'a' && ![6, 0].includes(dayOfWeek)) {
      location = 'Starlight Desert, Vault of Knowledge';
      type = 'Black Shard';
      colors = '#000000';
      rewards = '200 Wax <:wax:1125091974869946369>';
    } else if (currentEvent === 'A' && ![2, 3].includes(dayOfWeek)) {
      location = 'Jellyfish Cove, Starlight Desert, Vault of Knowledge';
      rewards = '3.5 AC <a:ac5:1125338720183267390>';
    } else if (currentEvent === 'b' && ![0, 1].includes(dayOfWeek)) {
      location = 'Starlight Desert, Vault of Knowledge';
      type = 'Black Shard';
      colors = '#000000';
      rewards = '200 Wax <:wax:1125091974869946369>';
    } else if (currentEvent === 'B' && ![3, 4].includes(dayOfWeek)) {
      location = 'Jellyfish Cove, Starlight Desert, Vault of Knowledge';
      rewards = '3.5 AC <a:ac5:1125338720183267390>';
    } else if (currentEvent === 'C' && ![1, 2].includes(dayOfWeek)) {
      location = 'Jellyfish Cove, Starlight Desert, Vault of Knowledge';
      rewards = '3.5 AC <a:ac5:1125338720183267390>';
    } else {
      showButtons = false;
    }
  }
  let disabled;
  if (showButtons) {
    result
      .addFields(
        { name: 'Shard Type', value: `${type}`, inline: true },
        { name: 'Location', value: `${location}`, inline: true },
        { name: 'Rewards', value: `${rewards}`, inline: true },
        { name: 'Status', value: `${eventStatus}` },
        { name: 'Countdown', value: `${timeRemaining}`, inline: true },
      )
      .setColor(colors);
    disabled = false;
  } else {
    result
      .setImage(
        'https://media.discordapp.net/attachments/867638574571323424/1155727524911923220/5F1548AC-C7DD-4127-AF6F-0BC388-unscreen.gif',
      )
      .setDescription(`**It's a no shard day.**`)
      .setColor('#9fb686');

    disabled = true;
  }
  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setEmoji('<a:left:1148644073670975640>')
      .setCustomId('prev')
      .setStyle('1'),
    new ButtonBuilder()
      .setEmoji('<a:right:1148627450608222278>')
      .setCustomId('next')
      .setStyle('1'),
    new ButtonBuilder()
      .setLabel('Timeline')
      .setCustomId('shard_timeline')
      .setDisabled(disabled)
      .setStyle('3'),
    new ButtonBuilder()
      .setLabel('Location/Data')
      .setCustomId('shard_location')
      .setDisabled(disabled)
      .setStyle('3'),
    new ButtonBuilder()
      .setLabel('About Shard')
      .setCustomId('about_shard')
      .setStyle('3'),
  );
  if (!interaction.isButton()) {
    await interaction.deferReply({ ephemeral: true });
    const reply = await interaction.editReply({
      embeds: [result],
      components: [actionRow],
      fetchReply: true,
    });
    const messageId = reply.id;

    saveMessageData({
      time: currentDate.format(),
      messageId,
      timestamp: moment().tz(timezone).format(),
    });
  } else {
    await interaction.update({ embeds: [result], components: [actionRow] });
  }

  function saveMessageData(data) {
    fs.readFile('messageData.json', 'utf8', (err, fileData) => {
      if (err) {
        if (err.code === 'ENOENT') {
          fileData = '[]';
        } else {
          console.error('Error reading file:', err);
          return;
        }
      }

      let jsonData = JSON.parse(fileData);
      jsonData.push(data);

      fs.writeFile(
        'messageData.json',
        JSON.stringify(jsonData, null, 2),
        (err) => {
          if (err) {
            console.error('Error writing file:', err);
          }
        },
      );
    });
  }
}

module.exports = {
  shardsReply,
};
