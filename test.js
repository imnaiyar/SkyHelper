const moment = require('moment-timezone');
const fs = require('fs');


const filePath = 'messageData.json';
  const timezone = 'America/Los_Angeles'
// Read the data from the JSON file
const data = fs.readFileSync(filePath, 'utf8');
const messageData = JSON.parse(data);

// Find the message by messageId
const message = messageData.find((data) => data.messageId === "1154732767121260604");

if (!message) {
  interaction.reply({
    content: 'No dates found for this message. The interaction might be expired, please run the command again',
    ephemeral: true
  });
  return false;
}
const value = 'prev'
// Increment currentDate by one day
const currentDate = moment.tz(message.time, 'Y-MM-DD', timezone).startOf('day');
let shardDate;
if (value === 'next') {
 shardDate = currentDate.add(1, 'day'); 
} else if (value === 'prev') {
  shardDate = currentDate.subtract(1, 'day'); 
}

message.time = shardDate.format();

fs.writeFileSync(filePath, JSON.stringify(messageData, null, 2), 'utf8');