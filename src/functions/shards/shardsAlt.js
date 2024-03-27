const moment = require("moment");
const shardsTime = require("./sub/eventTimings.js");
const util = require("@handler/shardsUtil");

/**
 * returns shard info for  a given date
 * @param {Date} currentDate - date for which shard info is needed
 * @returns
 */
async function shardsAlt(currentDate) {
  const timezone = "America/Los_Angeles";
  const dayOfWeek = currentDate.day();
  const formatDate = currentDate.format("DD MMMM YYYY");
  const today = moment().tz(timezone).startOf("day");
  const noShard = currentDate.isSame(today, "day") ? "Today" : `${formatDate}`;

  const { currentShard, currentRealm } = await util.shardsIndex(currentDate);
  const timings = shardsTime(currentDate);
  const eventTimings = timings[currentShard];

  let eventStatus = "";
  let timeRemaining = "";
  const present = moment().tz(timezone);

  for (let i = 0; i < eventTimings.length; i++) {
    const eventTiming = eventTimings[i];
    const startUnix = Math.floor(eventTiming.start.valueOf() / 1000);
    const endUnix = Math.floor(eventTiming.end.valueOf() / 1000);

    if (present.isBetween(eventTiming.start, eventTiming.end)) {
      const duration = moment.duration(eventTiming.end.diff(present));
      eventStatus = `${i + 1}${util.getSuffix(i + 1)} Shard is active right now`;
      timeRemaining = `Ends in ${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s (at <t:${endUnix}:t>)`;
      break;
    } else if (present.isBefore(eventTiming.start)) {
      const duration = moment.duration(eventTiming.start.diff(present));
      const hoursRemaining = Math.floor(duration.asHours());
      const minutesRemaining = Math.floor(duration.asMinutes()) % 60;
      const secondsRemaining = Math.floor(duration.asSeconds()) % 60;
      eventStatus = `${i + 1}${util.getSuffix(i + 1)} Shard has not fallen yet`;
      timeRemaining = `Falls in ${hoursRemaining}h ${minutesRemaining}m ${secondsRemaining}s (at <t:${startUnix}:T>)`;
      break;
    } else if (
      i < eventTimings.length - 1 &&
      present.isAfter(eventTiming.end) &&
      present.isBefore(eventTimings[i + 1].start)
    ) {
      const startUnix2 = Math.floor(eventTimings[i + 1].start.valueOf() / 1000);
      eventStatus = `${i + 1}${util.getSuffix(i + 1)} shard ended at <t:${endUnix}:t>, ${i + 2}${util.getSuffix(
        i + 2,
      )} Shard has not fallen yet`;
      const duration = moment.duration(eventTimings[i + 1].start.diff(present));
      timeRemaining = `Falls in ${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s (at <t:${startUnix2}:T>)`;
      break;
    } else if (i === eventTimings.length - 1 && present.isAfter(eventTiming.end)) {
      const unixEnd2 = Math.floor(eventTimings[eventTimings.length - 1].end.valueOf() / 1000);
      eventStatus = `All Shards ended for ${noShard}`;
      timeRemaining = "";

      const duration = moment.duration(present.diff(eventTimings[eventTimings.length - 1].end));
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
