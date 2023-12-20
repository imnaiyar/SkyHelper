const moment = require('moment-timezone');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const { shardsReply } = require('@shards/sub/shardsReply');

async function nextPrev(interaction, value) {
  const filePath = 'messageData.json';
  const timezone = 'America/Los_Angeles';
  // Read the data from the JSON file
  const data = fs.readFileSync(filePath, 'utf8');
  const messageData = JSON.parse(data);
  const messageId = interaction.message.id;
  // Find the message by messageId
  const message = messageData.find((data) => data.messageId === messageId);

  // Increment currentDate by one day
  const currentDate = moment
    .tz(message.time, 'Y-MM-DD', timezone)
    .startOf('day');
  let shardDate;
  if (value === 'next') {
    shardDate = currentDate.add(1, 'day');
  } else if (value === 'prev') {
    shardDate = currentDate.subtract(1, 'day');
  } else {
    shardDate = currentDate;
  }
  const {
    type,
    location,
    rewards,
    colors,
    showButtons,
    thumbUrl,
    noShard,
    eventStatus,
    timeRemaining,
    currentEvent,
    currentSecondEvent,
    dayOfWeek,
  } = await shardsReply(shardDate);

  let result = new EmbedBuilder()
    .setAuthor({
      name: `Shards Info`,
      iconURL:
        'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925',
    })
    .setTitle(`${noShard}`)
    .setTimestamp(Date.now())
    .setFooter({
      text: 'SkyHelper',
      iconURL: interaction.client.user.displayAvatarURL(),
    });
  let disabled;
  if (showButtons) {
    result
      .addFields(
        { name: `Shard Type`, value: `${type} (${rewards})`, inline: true },
        { name: 'Location', value: `${location}`, inline: true },
        { name: 'Status', value: `${eventStatus}` },
        { name: 'Countdown', value: `${timeRemaining}`, inline: true },
      )
      .setColor(colors)
      .setThumbnail(thumbUrl);
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
      .setCustomId('timeline')
      .setDisabled(disabled)
      .setStyle('3'),
    new ButtonBuilder()
      .setLabel('Location/Data')
      .setCustomId('location')
      .setDisabled(disabled)
      .setStyle('3'),
    new ButtonBuilder()
      .setLabel('About Shard')
      .setCustomId('about')
      .setStyle('3'),
  );

  await interaction.update({ embeds: [result], components: [actionRow] });
  message.time = shardDate.format();

  fs.writeFileSync(filePath, JSON.stringify(messageData, null, 2), 'utf8');
}

module.exports = { nextPrev };
