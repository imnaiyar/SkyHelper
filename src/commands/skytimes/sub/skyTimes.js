const moment = require('moment-timezone');
async function skyTimes() {
  const targetTimezone = 'America/Los_Angeles';
  const now = moment().tz(targetTimezone);

  // Geyser Calculation
  let geyserResultStr;
  const geyserTargetTime = now.clone().startOf('day');

  while (now.isAfter(geyserTargetTime)) {
    geyserTargetTime.add(2, 'hours');
  }
  const geyserStart = geyserTargetTime.clone().subtract(2, 'hours');

  const geyserEnd = geyserTargetTime
    .clone()
    .subtract(1, 'hours')
    .subtract(45, 'minutes');

  const geyserUnixTimestamp = Math.floor(geyserTargetTime.valueOf() / 1000);
  const geyserEndUnix = Math.floor(geyserEnd.valueOf() / 1000);
  if (now.isBetween(geyserStart, geyserEnd)) {
    const geyserDuration = moment.duration(geyserEnd.diff(now));
    const geyserOnEnd = `${geyserDuration.minutes()} minutes  ${geyserDuration.seconds()} seconds.`;
    geyserResultStr = `Geyser is currently ongoing and will end at <t:${geyserEndUnix}:t> (in  ${geyserOnEnd})\n - \`Next Geyser Time:\` <t:${geyserUnixTimestamp}:t>`;
  } else {
    const durationGeyser = moment.duration(geyserTargetTime.diff(now));

    geyserResultStr = `\`Next Geyser Time:\` <t:${geyserUnixTimestamp}:t> ( in `;
    if (durationGeyser.hours() > 0) {
      geyserResultStr += `${durationGeyser.hours()} hours`;
    }
    if (durationGeyser.minutes() > 0) {
      geyserResultStr += ` ${durationGeyser.minutes()} minutes`;
    }
    geyserResultStr += ` ${durationGeyser.seconds()} seconds)`;
  }

  // Grandma Calculation
  let grandmaResultStr;
  const grandmaTargetTime = now.clone().startOf('day').add(30, 'minutes');

  while (now.isAfter(grandmaTargetTime)) {
    grandmaTargetTime.add(2, 'hours');
  }
  const grandmaUnixTimestamp = Math.floor(grandmaTargetTime.valueOf() / 1000);
  const grandmaStart = grandmaTargetTime.clone().subtract(2, 'hours');

  const grandmaEnd = grandmaTargetTime
    .clone()
    .subtract(1, 'hours')
    .subtract(45, 'minutes');
  const grandmaEndUnix = Math.floor(grandmaEnd.valueOf() / 1000);
  if (now.isBetween(grandmaStart, grandmaEnd)) {
    const grandmaDuration = moment.duration(grandmaEnd.diff(now));
    const grandmaOnEnd = `${grandmaDuration.minutes()} minutes  ${grandmaDuration.seconds()} seconds.`;
    grandmaResultStr = `Grandma is currently ongoing and will end at <t:${grandmaEndUnix}:t> (in ${grandmaOnEnd})\n - \`Next Grandma Time:\` <t:${grandmaUnixTimestamp}:t>`;
  } else {
    const durationGrandma = moment.duration(grandmaTargetTime.diff(now));
    grandmaResultStr = `\`Next Grandma Time:\` <t:${grandmaUnixTimestamp}:t> ( in `;
    if (durationGrandma.hours() > 0) {
      grandmaResultStr += `${durationGrandma.hours()} hours`;
    }
    if (durationGrandma.minutes() > 0) {
      grandmaResultStr += ` ${durationGrandma.minutes()} minutes`;
    }
    grandmaResultStr += ` ${durationGrandma.seconds()} seconds)`;
  }

  // Turtle Calculation
  let turtleResultStr;
  const turtleTargetTime = now
    .clone()
    .startOf('day').add(50, 'minutes');

  while (now.isAfter(turtleTargetTime)) {
    turtleTargetTime.add(2, 'hours');
  }
  const turtleUnixTimestamp = Math.floor(turtleTargetTime.valueOf() / 1000);
  const turtleStart = turtleTargetTime.clone().subtract(2, 'hours');

  const turtleEnd = turtleTargetTime
    .clone()
    .subtract(1, 'hours')
    .subtract(45, 'minutes');
  const turtleEndUnix = Math.floor(turtleEnd.valueOf() / 1000);
  const durationTurtle = moment.duration(turtleTargetTime.diff(now));
  if (now.isBetween(turtleStart, turtleEnd)) {
    const turtleDuration = moment.duration(turtleEnd.diff(now));
    const turtleOnEnd = `${turtleDuration.minutes()} minutes  ${turtleDuration.seconds()} seconds.`;
    turtleResultStr = `Turtle is currently ongoing and will end at <t:${turtleEndUnix}:t>(in ${turtleOnEnd})\n - \`Next Turtle Time:\` <t:${turtleUnixTimestamp}:t>`;
  } else {
    turtleResultStr = `\`Next Turtle Time:\` <t:${turtleUnixTimestamp}:t> ( in `;
    if (durationTurtle.hours() > 0) {
      turtleResultStr += `${durationTurtle.hours()} hours`;
    }
    if (durationTurtle.minutes() > 0) {
      turtleResultStr += ` ${durationTurtle.minutes()} minutes`;
    }
    turtleResultStr += ` ${durationTurtle.seconds()} seconds)`;
  }
  // Reset Calculation
  const resetTargetTime = now
    .clone()
    .startOf('day');
    

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
  const targetDayOfWeek = 0; // 0 represents Sunday
  const currentDayOfWeek = now.day();

  let daysToAdd = targetDayOfWeek - currentDayOfWeek;
  const edenTargetTime = now
    .clone()
    .startOf('day')
    .add(daysToAdd, 'days');
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

  return {
    geyserResultStr,
    grandmaResultStr,
    resetResultStr,
    edenResultStr,
    turtleResultStr,
  };
}

module.exports = {
  skyTimes,
};
