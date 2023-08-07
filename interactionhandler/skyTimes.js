const moment = require('moment-timezone');
const { StimesReply } = require('../eventhandler/StimesReply');
const { PtimesReply } = require('../eventhandler/prefixListener');

async function skyTimes(interaction, message, args) {
  const targetTimezone = 'Asia/Kolkata';
  const now = moment().tz(targetTimezone);

  // Geyser Calculation
  let geyserResult;
  const geyserTargetTime = now.clone().startOf('day').add(30, 'minutes');

  while (now.isAfter(geyserTargetTime)) {
    geyserTargetTime.add(2, 'hours');
  }

  const geyserUnixTimestamp = Math.floor(geyserTargetTime.valueOf() / 1000);
  const durationGeyser = moment.duration(geyserTargetTime.diff(now));
  
  let geyserResultStr = `<t:${geyserUnixTimestamp}:t> ( in `;
  if (durationGeyser.hours() > 0) {
    geyserResultStr += `${durationGeyser.hours()} hours`;
  }
  if (durationGeyser.minutes() > 0) {
    geyserResultStr += ` ${durationGeyser.minutes()} minutes`;
  }
  geyserResultStr += ` ${durationGeyser.seconds()} seconds)`;


  // Grandma Calculation
  let grandmaResult;
  const grandmaTargetTime = now.clone().startOf('day').add(1, 'hours');

  while (now.isAfter(grandmaTargetTime)) {
    grandmaTargetTime.add(2, 'hours');
  }

  const grandmaUnixTimestamp = Math.floor(grandmaTargetTime.valueOf() / 1000);
  const durationGrandma = moment.duration(grandmaTargetTime.diff(now));
  let grandmaResultStr = `<t:${grandmaUnixTimestamp}:t> ( in `;
  if (durationGrandma.hours() > 0) {
    grandmaResultStr += `${durationGrandma.hours()} hours`;
  }
  if (durationGrandma.minutes() > 0) {
    grandmaResultStr += ` ${durationGrandma.minutes()} minutes`;
  }
  grandmaResultStr += ` ${durationGrandma.seconds()} seconds)`;

  // Turtle Calculation
  let turtleResult;
  const turtleTargetTime = now.clone().startOf('day').add(1, 'hours').add(20, 'minutes');

  while (now.isAfter(turtleTargetTime)) {
    turtleTargetTime.add(2, 'hours');
  }

  const turtleUnixTimestamp = Math.floor(turtleTargetTime.valueOf() / 1000);
  const durationTurtle = moment.duration(turtleTargetTime.diff(now));
  let turtleResultStr = `<t:${turtleUnixTimestamp}:t> ( in `;
  if (durationTurtle.hours() > 0) {
    turtleResultStr += `${durationTurtle.hours()} hours`;
  }
  if (durationTurtle.minutes() > 0) {
    turtleResultStr += ` ${durationTurtle.minutes()} minutes`;
  }
  turtleResultStr += ` ${durationTurtle.seconds()} seconds)`;

  // Reset Calculation
  let resetResult;
  const resetTargetTime = now.clone().startOf('day').add(12, 'hours').add(30, 'Minutes');

  if (now.isSameOrAfter(resetTargetTime)) {
    resetTargetTime.add(1, 'days');
  }

  const resetUnixTimestamp = Math.floor(resetTargetTime.valueOf() / 1000);
  const durationReset = moment.duration(resetTargetTime.diff(now));
  let resetResultStr = `<t:${resetUnixTimestamp}:F> ( in `;
  if (durationReset.hours() > 0) {
    resetResultStr += `${durationReset.hours()} hours`;
  }
  if (durationReset.minutes() > 0) {
    resetResultStr += ` ${durationReset.minutes()} minutes`;
  }
  resetResultStr += ` ${durationReset.seconds()} seconds)`;


  // Eden Calculation
  let edenResult;
  const targetDayOfWeek = 0; // 0 represents Sunday
  const currentDayOfWeek = now.day();

  let daysToAdd = targetDayOfWeek - currentDayOfWeek;
  const edenTargetTime = now.clone().startOf('day').add(daysToAdd, 'days').hour(12).minute(30).second(0);
  if (daysToAdd <= 0 || (daysToAdd === 0 && now.isAfter(edenTargetTime))) {
    daysToAdd += 7;
  }

  if (now.isSameOrAfter(edenTargetTime)) {
    edenTargetTime.add(7, 'days');
  }

  const edenUnixTimestamp = Math.floor(edenTargetTime.valueOf() / 1000);
  const durationEden = moment.duration(edenTargetTime.diff(now));
  let edenResultStr = `<t:${edenUnixTimestamp}:F> ( in `;
  if (durationEden.days() > 0) {
  edenResultStr += `${durationEden.days()} days`;
}
if (durationEden.hours() > 0) {
  edenResultStr += ` ${durationEden.hours()} hours`;
}
if (durationEden.minutes() > 0) {
  edenResultStr += ` ${durationEden.minutes()} minutes`;
}
edenResultStr += ` ${durationEden.seconds()} seconds)`;


  
  if (message || args) {
    await PtimesReply(message, args, geyserResult, grandmaResult, resetResult, edenResult, turtleResult);}
  else
  if (interaction) {
    await StimesReply(interaction, geyserResultStr, grandmaResultStr, resetResultStr, edenResultStr, turtleResultStr);
  }
  
}

module.exports = {
skyTimes
};
