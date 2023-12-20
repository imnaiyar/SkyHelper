const moment = require('moment');
const shardsTime = require('./sub/eventTimings.js');
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
];
const secondEventSequence = [
  'prairie',
  'forest',
  'valley',
  'wasteland',
  'vault',
];

async function shardsAlt(currentDate) {
  const timezone = 'America/Los_Angeles';
  const dayOfMonth = currentDate.date();
  const dayOfWeek = currentDate.day();
  const formatDate = currentDate.format('DD MMMM YYYY');
  const today = moment().tz(timezone).startOf('day');
  const noShard = currentDate.isSame(today, 'day') ? 'Today' : `${formatDate}`;

  // Calculate the index in the event sequences
  const sequenceIndex = (dayOfMonth - 1) % eventSequence.length;
  const currentEvent = eventSequence[sequenceIndex];
  const secondSequenceIndex = (dayOfMonth - 1) % secondEventSequence.length;
  const currentSecondEvent = secondEventSequence[secondSequenceIndex];
  function getOrdinalSuffix(number) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const remainder10 = number % 10;
    const remainder100 = number % 100;

    // Suffix for shards index
    return suffixes[
      remainder10 === 1 && remainder100 !== 11
        ? 1
        : remainder10 === 2 && remainder100 !== 12
        ? 2
        : remainder10 === 3 && remainder100 !== 13
        ? 3
        : 0
    ];
  }
  // Extracting the shards timings
  const timings = shardsTime(currentDate);
  let eventTimings;
  if (currentEvent === 'A') {
    eventTimings = timings.A;
  } else if (currentEvent === 'B') {
    eventTimings = timings.B;
  } else if (currentEvent === 'C') {
    eventTimings = timings.C;
  } else if (currentEvent === 'a') {
    eventTimings = timings.a;
  } else if (currentEvent === 'b') {
    eventTimings = timings.b;
  }

  // Defining durations of shards timings
  let eventStatus = '';
  let timeRemaining = '';
  let lastEventEndTime = eventTimings[eventTimings.length - 1].end;

  for (let i = 0; i < eventTimings.length; i++) {
    const eventTiming = eventTimings[i];
    const present = moment().tz(timezone);

    if (present.isBetween(eventTiming.start, eventTiming.end)) {
      const endUnix = Math.floor(eventTiming.end.valueOf() / 1000);
      eventStatus = `${i + 1}${getOrdinalSuffix(
        i + 1,
      )} Shard is active right now`;
      const duration = moment.duration(eventTiming.end.diff(present));
      timeRemaining = `Ends in ${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s (at <t:${endUnix}:t>)`;
      break;
    } else if (present.isBefore(eventTiming.start)) {
      const startUnix = Math.floor(eventTiming.start.valueOf() / 1000);
      eventStatus = `${i + 1}${getOrdinalSuffix(
        i + 1,
      )} Shard has not fallen yet`;
      const duration = moment.duration(eventTiming.start.diff(present));
      const hoursRemaining = Math.floor(duration.asHours());
      const minutesRemaining = Math.floor(duration.asMinutes()) % 60;
      const secondsRemaining = Math.floor(duration.asSeconds()) % 60;
      timeRemaining = `Falls in ${hoursRemaining}h ${minutesRemaining}m ${secondsRemaining}s (at <t:${startUnix}:T>)`;
      break;
    } else if (
      i < eventTimings.length - 1 &&
      present.isAfter(eventTiming.end) &&
      present.isBefore(eventTimings[i + 1].start)
    ) {
      const startUnix2 = Math.floor(eventTimings[i + 1].start.valueOf() / 1000);
      const endUnix3 = Math.floor(eventTiming.end.valueOf() / 1000);
      eventStatus = `${i + 1}${getOrdinalSuffix(
        i + 1,
      )} shard ended at <t:${endUnix3}:t>, ${i + 2}${getOrdinalSuffix(
        i + 2,
      )} shard has not fallen yet`;
      const duration = moment.duration(eventTimings[i + 1].start.diff(present));
      timeRemaining = `Falls in ${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s (at <t:${startUnix2}:T>)`;
      break;
    } else if (
      i === eventTimings.length - 1 &&
      present.isAfter(eventTiming.end)
    ) {
      const unixEnd2 = Math.floor(lastEventEndTime.valueOf() / 1000);
      eventStatus = `All Shards ended for ${noShard}`;
      timeRemaining = '';

      const duration = moment.duration(present.diff(lastEventEndTime));
      const hoursRemaining = Math.floor(duration.asHours());
      const minutesRemaining = Math.floor(duration.asMinutes()) % 60;
      const secondsRemaining = Math.floor(duration.asSeconds()) % 60;
      timeRemaining = `${hoursRemaining}h ${minutesRemaining}m ${secondsRemaining}s ago (at <t:${unixEnd2}:t>)`;
      break;
    }
  }
  return {
    formatDate,
    eventStatus,
    timeRemaining,
    currentEvent,
    currentSecondEvent,
    dayOfWeek,
    noShard,
  };
}

module.exports = { shardsAlt };
