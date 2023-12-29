const moment = require('moment-timezone');
const { time } = require('discord.js');

const targetTimezone = 'America/Los_Angeles';
  const now = moment().tz(targetTimezone);
async function calculateResult(targetTime, offset = 0) {
  const target = now.clone().startOf('day').add(offset, 'minutes');
  while (now.isAfter(target)) {
    target.add(2, 'hours');
  }

  const start = target.clone().subtract(2, 'hours');
  const end = target.clone().subtract(1, 'hours').subtract(45, 'minutes');

  if (now.isBetween(start, end)) {
    const duration = moment.duration(end.diff(now));
    return `${targetTime} is ongoing and will end at ${time(end.toDate(), 't')} (in ${duration.minutes()} minutes ${duration.seconds()} seconds)\n - \`Next ${targetTime} Time:\` ${time(target.toDate(), 't')}`;
  } else {
    const duration = moment.duration(target.diff(now));
    return `\`Next ${targetTime} Time:\` ${time(target.toDate(), 't')} ( in ${duration.hours()} hours ${duration.minutes()} minutes ${duration.seconds()} seconds)`;
  }
}

async function skyTimes(client) {
// geyser
  const geyserResultStr = await calculateResult('Geyser');
  // grandma
  const grandmaResultStr = await calculateResult('Grandma', 30);
  // grandma
  const turtleResultStr = await calculateResult('Turtle', 50);

 // reset
  const resetTargetTime = now.clone().startOf('day').add(now.isSameOrAfter(now.clone().startOf('day')) ? 1 : 0, 'days');
  const durationReset = moment.duration(resetTargetTime.diff(now));
  const resetResultStr = `${time(resetTargetTime.toDate(), 'F')} ( in ${durationReset.hours()} hours ${durationReset.minutes()} minutes ${durationReset.seconds()} seconds)`;

// eden
  const targetDayOfWeek = 0;
  const currentDayOfWeek = now.day();
  let daysToAdd = targetDayOfWeek - currentDayOfWeek;
  let edenTargetTime = now.clone().startOf('day').add(daysToAdd, 'days');
if (daysToAdd <= 0 || (daysToAdd === 0 && now.isAfter(edenTargetTime))) {
  edenTargetTime.add(7, 'days');
}
  if (now.isSameOrAfter(edenTargetTime)) {
    edenTargetTime.add(7, 'days');
  }
  const durationEden = moment.duration(edenTargetTime.diff(now));
  const edenResultStr = `${time(edenTargetTime.toDate(), 'F')} ( in ${durationEden.days()} days ${durationEden.hours()} hours ${durationEden.minutes()} minutes ${durationEden.seconds()} seconds)`;

// event
  const eventDur = moment.duration(client.skyEvents.eventEnds.diff(now));
  
  let eventDescription = (client.skyEvents.eventActive && !now.isAfter(client.skyEvents.eventEnds)) ? `${client.skyEvents.eventName} is currently active, and ends on ${time(client.skyEvents.eventEnds.toDate(), 'f')} (in ${eventDur.days()} days ${eventDur.hours()} hours ${eventDur.minutes()} minutes ${eventDur.seconds()} seconds)` : 'No active events.';

  return { geyserResultStr, grandmaResultStr, resetResultStr, edenResultStr, turtleResultStr, eventDescription };
}

module.exports = { skyTimes };