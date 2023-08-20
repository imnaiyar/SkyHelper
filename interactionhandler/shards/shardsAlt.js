const moment = require('moment');
const fs = require('fs');
const momentTimezone = require('moment-timezone');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const {actionRow} = require('./Buttons');

const eventSequence = ['C', 'b', 'A', 'a', 'B', 'b', 'C', 'a', 'A', 'b', 'B', 'a'];
const secondEventSequence = ['prairie', 'forest', 'valley', 'wasteland', 'vault'];

async function shardsALt(interaction){
    const timezone = 'America/Los_Angeles';
    const messageDataFile = 'messageData.json';
const tenMinutesInMillis = 15 * 60 * 1000; 
 fs.readFile(messageDataFile, 'utf8', (err, data) => {

  if (err) {

    console.error(`Error reading ${messageDataFile}:`, err);
    return;
  }

  let messages = [];
  try {
    messages = JSON.parse(data);
  } catch (error) {
    console.error(`Error parsing JSON data:`, error);
    return;
  }
  
  const currentTime = moment().tz(timezone);
  const updatedMessages = messages.filter((message) => {
    const messageTime = moment.tz(message.timestamp, timezone);
    return currentTime.diff(messageTime) <= tenMinutesInMillis;
  });

  fs.writeFile(messageDataFile, JSON.stringify(updatedMessages), 'utf8', (err) => {
    if (err) {
      console.error(`Error writing ${messageDataFile}:`, err);
      return;
    }
    console.log('Data successfully updated.');
  });
});
    const dateOption = interaction.options.getString('date');

    let currentDate;
    let dayOfMonth;
    let dayOfWeek;
    let formatDate;

    try {
        if (dateOption) {
            // Attempt to parse the provided date
            currentDate = moment.tz(dateOption, 'Y-MM-DD', timezone).startOf('day');

            // If the provided date is not valid, currentDate will be Invalid Date
            if (!currentDate.isValid()) {
                await interaction.reply({content: `${dateOption} does not exist, please provide a valid date.`, ephemeral: true});
                return;
            }
        } else {
            // If no date is provided, use the current date
            currentDate = moment().tz(timezone);
        }

        dayOfMonth = currentDate.date();
        dayOfWeek = currentDate.day();
        formatDate = currentDate.format('DD MMMM YYYY');
    } catch (error) {
        await interaction.reply('An error occurred while processing the date.');
        return;
    }
    
    const today = moment().tz(timezone).startOf('day');
    const noShard = currentDate.isSame(today, 'day')
  ? 'today'
  : `on ${formatDate}`;

    // Calculate the index in the event sequences
    const sequenceIndex = (dayOfMonth - 1) % eventSequence.length;
    const currentEvent = eventSequence[sequenceIndex];
    const secondSequenceIndex = (dayOfMonth - 1) % secondEventSequence.length;
    const currentSecondEvent = secondEventSequence[secondSequenceIndex];
    const endDate = currentDate; // Create a moment object for the start date

    const startDate = moment.tz(timezone);

    const daysToAdd = endDate.diff(startDate, 'days');
    
    function getOrdinalSuffix(number) {
    const suffixes = ["th", "st", "nd", "rd"];
    const remainder10 = number % 10;
    const remainder100 = number % 100;

    return suffixes[(remainder10 === 1 && remainder100 !== 11) ? 1 :
           (remainder10 === 2 && remainder100 !== 12) ? 2 :
           (remainder10 === 3 && remainder100 !== 13) ? 3 : 0];
}
    // Define the event timings
    const eventTimingsC = [
      { start: currentDate.clone().startOf('day').add(7, 'hours').add(48, 'minutes').add(40, 'seconds'), end: currentDate.clone().startOf('day').add(11, 'hours').add(40, 'minutes') },
      { start: currentDate.clone().startOf('day').add(13, 'hours').add(48, 'minutes').add(40, 'seconds'), end: currentDate.clone().startOf('day').add(17, 'hours').add(40, 'minutes') },
      { start: currentDate.clone().startOf('day').add(19, 'hours').add(48, 'minutes').add(40, 'seconds'), end: currentDate.clone().startOf('day').add(23, 'hours').add(40, "minutes") }
  ];
  
  const eventTimingsA = [
      { start: currentDate.clone().startOf('day').add(2, 'hours').add(28, 'minutes').add(40, 'seconds'), end: currentDate.clone().startOf('day').add(6, 'hours').add(20, 'minutes') },
      { start: currentDate.clone().startOf('day').add(8, 'hours').add(28, 'minutes').add(40, 'seconds'), end: currentDate.clone().startOf('day').add(12, 'hours').add(20, 'minutes') },
      { start: currentDate.clone().startOf('day').add(14, 'hours').add(28, 'minutes').add(40, 'seconds'), end: currentDate.clone().startOf('day').add(18, 'hours').add(20, "minutes") }
  ];
  
  const eventTimingsa = [
      { start: currentDate.clone().startOf('day').add(1, 'hours').add(58, 'minutes').add(40, 'seconds'), end: currentDate.clone().startOf('day').add(5, 'hours').add(50, 'minutes') },
      { start: currentDate.clone().startOf('day').add(9, 'hours').add(58, 'minutes').add(40, 'seconds'), end: currentDate.clone().startOf('day').add(13, 'hours').add(50, 'minutes') },
      { start: currentDate.clone().startOf('day').add(17, 'hours').add(58, 'minutes').add(40, 'seconds'), end: currentDate.clone().startOf('day').add(21, 'hours').add(50, "minutes") }
  ];
  
  const eventTimingsB = [
      { start: currentDate.clone().startOf('day').add(3, 'hours').add(38, 'minutes').add(40, 'seconds'), end: currentDate.clone().startOf('day').add(7, 'hours').add(30, 'minutes') },
      { start: currentDate.clone().startOf('day').add(9, 'hours').add(38, 'minutes').add(40, 'seconds'), end: currentDate.clone().startOf('day').add(13, 'hours').add(30, 'minutes') },
      { start: currentDate.clone().startOf('day').add(15, 'hours').add(38, 'minutes').add(40, 'seconds'), end: currentDate.clone().startOf('day').add(19, 'hours').add(30, "minutes") }
  ];
  
  const eventTimingsb = [
      { start: currentDate.clone().startOf('day').add(2, 'hours').add(18, 'minutes').add(40, 'seconds'), end: currentDate.clone().startOf('day').add(6, 'hours').add(10, 'minutes') },
      { start: currentDate.clone().startOf('day').add(10, 'hours').add(18, 'minutes').add(40, 'seconds'), end: currentDate.clone().startOf('day').add(14, 'hours').add(10, 'minutes') },
      { start: currentDate.clone().startOf('day').add(18, 'hours').add(18, 'minutes').add(40, 'seconds'), end: currentDate.clone().startOf('day').add(22, 'hours').add(10, "minutes") }
  ];
    let eventTimings;
if (currentEvent === 'A') {
    eventTimings = eventTimingsA;
} else if (currentEvent === 'B') {
   eventTimings = eventTimingsB;}
  else if (currentEvent === 'C') {
    eventTimings = eventTimingsC;}
  else if (currentEvent === 'B') {
    eventTimings = eventTimingsB;}
  else if (currentEvent === 'a') {
    eventTimings = eventTimingsa;}
  else if (currentEvent === 'b') {
    eventTimings = eventTimingsb;}

    let eventStatus = '';
    let timeRemaining = '';
    let lastEventEndTime = eventTimings[eventTimings.length - 1].end;

    for (let i = 0; i < eventTimings.length; i++) {
        const eventTiming = eventTimings[i];
        const present = moment().tz(timezone);
         const endDate2 = lastEventEndTime; 
         const startDate2 = moment.tz(timezone);

         const daysToAdd2 = endDate2.diff(startDate2, 'days');

        if (present.isBetween(eventTiming.start, eventTiming.end)) {
             const endUnix = Math.floor(eventTiming.end.valueOf() / 1000);
           eventStatus = `${i + 1}${getOrdinalSuffix(i + 1)} shard has landed `;
            const duration = moment.duration(eventTiming.end.diff(present));
            timeRemaining = `and will end in ${duration.hours()} hours, ${duration.minutes()} minutes, ${duration.seconds()} seconds at <t:${endUnix}:t>`;
            break;
        } else if (present.isBefore(eventTiming.start)) {
          const startUnix = Math.floor(eventTiming.start.valueOf() / 1000);
            eventStatus = `${i + 1}${getOrdinalSuffix(i + 1)} shard will land`;
            const duration = moment.duration(eventTiming.start.diff(present));
              const hoursRemaining = Math.floor(duration.asHours());
              const minutesRemaining = Math.floor(duration.asMinutes()) % 60;
              const secondsRemaining = Math.floor(duration.asSeconds()) % 60;
            timeRemaining = `${hoursRemaining} hours, ${minutesRemaining} minutes, ${secondsRemaining} seconds until <t:${startUnix}:T>`;
            break;
        } else if (i < eventTimings.length - 1 && present.isAfter(eventTiming.end) && present.isBefore(eventTimings[i + 1].start)) {
          
       const startUnix2 = Math.floor(eventTimings[i + 1].start.valueOf() / 1000);  
       const endUnix3 = Math.floor(eventTiming.end.valueOf() / 1000);
            eventStatus = `${i + 1}${getOrdinalSuffix(i + 1)} shard has ended (at <t:${endUnix3}:t>), ${i + 2}${getOrdinalSuffix(i + 2)} shard will land `;
            const duration = moment.duration(eventTimings[i + 1].start.diff(present));
            timeRemaining = ` in ${duration.hours()} hours, ${duration.minutes()} minutes, ${duration.seconds()} seconds at <t:${startUnix2}:T>`;
            break;
        } else if (i === eventTimings.length - 1 && present.isAfter(eventTiming.end)) {
        const unixEnd2 = Math.floor(lastEventEndTime.valueOf() / 1000);
        eventStatus = `All Shards Ended at <t:${unixEnd2}:t> ${noShard}`;
        timeRemaining = '';
        

        const duration = moment.duration(present.diff(lastEventEndTime));
              const hoursRemaining = Math.floor(duration.asHours());
              const minutesRemaining = Math.floor(duration.asMinutes()) % 60;
              const secondsRemaining = Math.floor(duration.asSeconds()) % 60;
            timeRemaining = `${hoursRemaining} hours, ${minutesRemaining} minutes, ${secondsRemaining} seconds ago.`;
        break;
    }
    }
    let result = '';
    let showButtons = true;

    // Check the current second event, day of the week, and the restrictions
    if (currentSecondEvent === 'prairie') {
        if (currentEvent === 'a' && ![6, 0].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#000000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Black Shard', inline: true })

            .addFields({ name: 'Location', value: 'Butterfly Fields, Daylight Prairie', inline: true })

             .addFields({ name: 'Rewards', value: '200 Wax <:wax:1125091974869946369>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'A' && ![2, 3].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Bird\'s Nest, Daylight Prairie', inline: true })

             .addFields({ name: 'Rewards', value: '2.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'b' && ![0, 1].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#000000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Black Shard', inline: true })

            .addFields({ name: 'Location', value: 'Village Island, Daylight Prairie', inline: true })

             .addFields({ name: 'Rewards', value: '200 Wax <:wax:1125091974869946369>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'B' && ![3, 4].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Sanctuary Island, Daylight Prairie', inline: true })

             .addFields({ name: 'Rewards', value: '3.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'C' && ![1, 2].includes(dayOfWeek)) {
            result = new EmbedBuilder()

             .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

             .setTimestamp(Date.now())

             .setColor('#FF0000')

             .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

              .addFields({ name: 'Shard Info', value: 'Red Shard', inline: true })

             .addFields({ name: 'Location', value: 'Pararie Caves, Daylight Parairies', inline: true })

              .addFields({ name: 'Rewards', value: '2 AC <a:ac5:1125338720183267390>', inline: true })

             .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});
        } else {
            result = new EmbedBuilder()

               .setAuthor({ name: `There is no shard ${noShard}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})
               .setColor('#808080');
          showButtons = false;
;
        }
    } else if (currentSecondEvent === 'forest') {
        if (currentEvent === 'a' && ![6, 0].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#000000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Black Shard', inline: true })

            .addFields({ name: 'Location', value: 'Forest Brook, Hidden Forest', inline: true })

             .addFields({ name: 'Rewards', value: '200 Wax <:wax:1125091974869946369>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'A' && ![2, 3].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Treehouse, Hidden Forest', inline: true })

             .addFields({ name: 'Rewards', value: '3.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'b' && ![0, 1].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#000000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Black Shard', inline: true })

            .addFields({ name: 'Location', value: 'Boneyard, Hidden Forest', inline: true })

             .addFields({ name: 'Rewards', value: '200 Wax <:wax:1125091974869946369>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'B' && ![3, 4].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Sunny Forest, Hidden Forest', inline: true })

             .addFields({ name: 'Rewards', value: '3.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'C' && ![1, 2].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Forest End, Hidden Forest', inline: true })

             .addFields({ name: 'Rewards', value: '2.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else {
            result = new EmbedBuilder()
                .setAuthor({ name: `There is no shard ${noShard}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})
                .setColor('#808080');
            showButtons = false;
          }
    } else if (currentSecondEvent === 'valley') {
        if (currentEvent === 'a' && ![6, 0].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#000000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Black Shard', inline: true })

            .addFields({ name: 'Location', value: 'Ice Rink, Valley of Triumph', inline: true })

             .addFields({ name: 'Rewards', value: '200 Wax <:wax:1125091974869946369>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'A' && ![2, 3].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Village of Dreams, Valley of Triumph', inline: true })

             .addFields({ name: 'Rewards', value: '2.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'b' && ![0, 1].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#000000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Black Shard', inline: true })

            .addFields({ name: 'Location', value: 'Ice Rink, Valley of Triumph', inline: true })

             .addFields({ name: 'Rewards', value: '200 Wax <:wax:1125091974869946369>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'B' && ![3, 4].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Hermit\'s Valley, Valley of Triumph', inline: true })

             .addFields({ name: 'Rewards', value: '3.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'C' && ![1, 2].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Village of Dreams, Valley of Triumph', inline: true })

             .addFields({ name: 'Rewards', value: '2.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else {
            result =  new EmbedBuilder()
                .setAuthor({ name: `There is no shard ${noShard}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})
                .setColor('#808080');
            showButtons = false;
        }
    } else if (currentSecondEvent === 'wasteland') {
        if (currentEvent === 'a' && ![6, 0].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#000000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Black Shard', inline: true })

            .addFields({ name: 'Location', value: 'Broken Temple, Golden Wasteland', inline: true })

             .addFields({ name: 'Rewards', value: '200 Wax <:wax:1125091974869946369>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});
        } else if (currentEvent === 'A' && ![2, 3].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Crab Fields, Golden Wasteland', inline: true })

             .addFields({ name: 'Rewards', value: '2.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'b' && ![0, 1].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#000000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Black Shard', inline: true })

            .addFields({ name: 'Location', value: 'Battlefield, Golden Wasteland', inline: true })

             .addFields({ name: 'Rewards', value: '200 Wax <:wax:1125091974869946369>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'B' && ![3, 4].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Forgotten Ark, Golden Wasteland', inline: true })

             .addFields({ name: 'Rewards', value: '3.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});
        } else if (currentEvent === 'C' && ![1, 2].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Graveyard, Golden Wasteland', inline: true })

             .addFields({ name: 'Rewards', value: '2 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else {
            result =  new EmbedBuilder()
                .setAuthor({ name: `There is no shard ${noShard}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})
                .setColor('#808080');
            showButtons = false;
        }
    } else if (currentSecondEvent === 'vault') {
        if (currentEvent === 'a' && ![6, 0].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#000000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Black Shard', inline: true })

            .addFields({ name: 'Location', value: 'Starlight Desert, Vault of Knowledge', inline: true })

             .addFields({ name: 'Rewards', value: '200 Wax <:wax:1125091974869946369>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'A' && ![2, 3].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Jellyfish Cove, Starlight Desert, Vault of Knowledge', inline: true })

             .addFields({ name: 'Rewards', value: '3.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'b' && ![0, 1].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#000000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Black Shard', inline: true })

            .addFields({ name: 'Location', value: 'Starlight Desert, Vault of Knowledge', inline: true })

             .addFields({ name: 'Rewards', value: '200 Wax <:wax:1125091974869946369>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'B' && ![3, 4].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Jellyfish Cove, Starlight Desert, Vault of Knowledge', inline: true })

             .addFields({ name: 'Rewards', value: '3.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'C' && ![1, 2].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Jellyfish Cove, Starlight Desert, Vault of Knowledge', inline: true })

             .addFields({ name: 'Rewards', value: '3.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else {
            result =  new EmbedBuilder()
                .setAuthor({ name: `There is no shard ${noShard}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})
                .setColor('#808080');
            showButtons = false;
        }
    } 

if (!interaction.isButton()) {

  if (showButtons) {
      await interaction.deferReply({ephemeral: true});
    const reply = await interaction.editReply({ embeds: [result], components: [actionRow], fetchReply: true });
    const messageId = reply.id;
    
    saveMessageData({ time: currentDate.format(), messageId, timestamp: moment().tz(timezone).format() });
  } else {
      await interaction.deferReply({ephemeral: true});
    const reply = await interaction.editReply({ embeds: [result], fetchReply: true });
    const messageId = reply.id;
    
    saveMessageData({ time: currentDate.format(), messageId, timestamp: moment().tz(timezone).format() });
  }
} else {
  if (showButtons) {
    const reply = await interaction.update({ embeds: [result], components: [actionRow], fetchReply: true });
    const messageId = reply.id;
    
    saveMessageData({ time: currentDate.format(), messageId, timestamp: moment().tz(timezone).format() });
  } else {
    const reply = await interaction.update({ embeds: [result], fetchReply: true });
    const messageId = reply.id;
    saveMessageData({ time: currentDate.format(), messageId, timestamp: moment().tz(timezone).format() });
  }
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

    fs.writeFile('messageData.json', JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        console.error('Error writing file:', err);
      }
    });
  });
}
}
module.exports = { shardsALt };
