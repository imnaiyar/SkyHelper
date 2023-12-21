const moment = require('moment');
const shardsTime = require('./sub/eventTimings.js');
const { shardsIndex, getSuffix } = require('@functions/shardsUtil');
async function shardsAlt(currentDate) {
  const timezone = 'America/Los_Angeles';
  const dayOfWeek = currentDate.day();
  const formatDate = currentDate.format('DD MMMM YYYY');
  const today = moment().tz(timezone).startOf('day');
  const noShard = currentDate.isSame(today, 'day') ? 'Today' : `${formatDate}`;

  // get the shard and realm index
  const { currentShard, currentRealm } = await shardsIndex(currentDate);

  // Extracting the shards timings
  const timings = shardsTime(currentDate);
  let eventTimings;
  if (currentShard === 'A') {
    eventTimings = timings.A;
  } else if (currentShard === 'B') {
    eventTimings = timings.B;
  } else if (currentShard === 'C') {
    eventTimings = timings.C;
  } else if (currentShard === 'a') {
    eventTimings = timings.a;
  } else if (currentShard === 'b') {
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
      eventStatus = `${i + 1}${getSuffix(i + 1)} Shard is active right now`;
      const duration = moment.duration(eventTiming.end.diff(present));
      timeRemaining = `Ends in ${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s (at <t:${endUnix}:t>)`;
      break;
    } else if (present.isBefore(eventTiming.start)) {
      const startUnix = Math.floor(eventTiming.start.valueOf() / 1000);
      eventStatus = `${i + 1}${getSuffix(i + 1)} Shard has not fallen yet`;
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
      eventStatus = `${i + 1}${getSuffix(
        i + 1,
      )} shard ended at <t:${endUnix3}:t>, ${i + 2}${getSuffix(
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
    currentShard,
    currentRealm,
    dayOfWeek,
    noShard,
  };
}

module.exports = { shardsAlt };
