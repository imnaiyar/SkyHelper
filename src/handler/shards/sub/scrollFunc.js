const moment = require('moment-timezone');
const fs = require('fs');
const { shardsAlt } = require('@shards/shardsAlt')

async function nextPrev(interaction, value) {
  const filePath = 'messageData.json';
  const timezone = 'America/Los_Angeles'
// Read the data from the JSON file
const data = fs.readFileSync(filePath, 'utf8');
const messageData = JSON.parse(data);
const messageId = interaction.message.id
// Find the message by messageId
const message = messageData.find((data) => data.messageId === messageId);

// Increment currentDate by one day
const currentDate = moment.tz(message.time, 'Y-MM-DD', timezone).startOf('day');
let shardDate;
if (value === 'next') {
 shardDate = currentDate.add(1, 'day'); 
} else if (value === 'prev') {
  shardDate = currentDate.subtract(1, 'day'); 
} else {
  shardDate = currentDate
}
await shardsAlt(interaction, shardDate)
message.time = shardDate.format();

fs.writeFileSync(filePath, JSON.stringify(messageData, null, 2), 'utf8');
}

module.exports = { nextPrev }