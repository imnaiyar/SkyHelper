const moment = require('moment');
const { shardsReply } = require('./shardsReply');

const eventSequence = ['C', 'b', 'A', 'a', 'B', 'b', 'C', 'a', 'A', 'b', 'B', 'a'];
const secondEventSequence = ['prairie', 'forest', 'valley', 'wasteland', 'vault'];

async function shardsALt(interaction){
    const timezone = 'America/Los_Angeles';
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
        const present = moment().tz(timezone)

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
   await shardsReply(interaction,currentDate, formatDate, eventStatus,timeRemaining, currentEvent, currentSecondEvent, dayOfWeek);
}
module.exports = { shardsALt };
