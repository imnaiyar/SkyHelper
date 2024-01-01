const moment = require('moment-timezone');
const fs = require('fs');
const buildShardEmbed = require('@functions/buildShardEmbed');

async function nextPrev(interaction, value) {
  const filePath = 'messageData.json';
  // Read the data from the JSON file
  const data = fs.readFileSync(filePath, 'utf8');
  const messageData = JSON.parse(data);
  const messageId = interaction.message.id;
  // Find the message by messageId
  const message = messageData.find((data) => data.messageId === messageId);

  // Increment currentDate by one day
  const currentDate = moment
    .tz(message.time, 'Y-MM-DD', interaction.client.timezone)
    .startOf('day');
  let shardDate;
  if (value === 'next') {
    shardDate = currentDate.add(1, 'day');
  } else if (value === 'prev') {
    shardDate = currentDate.subtract(1, 'day');
  } else {
    shardDate = currentDate;
  }
  const { result, actionRow } = await buildShardEmbed(shardDate, 'SkyHelper');

  await interaction.update({ embeds: [result], components: [actionRow] });
  message.time = shardDate.format();

  fs.writeFileSync(filePath, JSON.stringify(messageData, null, 2), 'utf8');
}

module.exports = { nextPrev };
