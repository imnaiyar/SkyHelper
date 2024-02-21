const moment = require("moment-timezone");
require("moment-duration-format");
const { time } = require("discord.js");

const targetTimezone = "America/Los_Angeles";
async function calculateResult(targetTime, now, offset = 0) {
  const target = now.clone().startOf("day").add(offset, "minutes");
  while (now.isAfter(target)) {
    target.add(2, "hours");
  }

  const start = target.clone().subtract(2, "hours");
  const end = target.clone().subtract(1, "hours").subtract(45, "minutes");

  if (now.isBetween(start, end)) {
    const duration = moment.duration(end.diff(now)).format("d [days] h [hours] mm [minutes] ss [seconds]");
    return `${targetTime} is ongoing and will end at ${time(
      end.toDate(),
      "t",
    )} (in ${duration})\n> - \`Next ${targetTime} Time:\` ${time(target.toDate(), "t")}`;
  } else {
    const duration = moment.duration(target.diff(now)).format("d [days] h [hours] mm [minutes] ss [seconds]");
    return `\`Next ${targetTime} Time:\` ${time(target.toDate(), "t")} ( in ${duration})`;
  }
}

async function skyTimes(client) {
  const now = moment().tz(targetTimezone);
  // geyser
  const geyserResultStr = await calculateResult("Geyser", now);
  // grandma
  const grandmaResultStr = await calculateResult("Grandma", now, 30);
  // grandma
  const turtleResultStr = await calculateResult("Turtle", now, 50);

  // reset
  const resetTargetTime = now
    .clone()
    .startOf("day")
    .add(now.isSameOrAfter(now.clone().startOf("day")) ? 1 : 0, "days");
  const durationReset = moment
    .duration(resetTargetTime.diff(now))
    .format("d [days] h [hours] mm [minutes] ss [seconds]");
  const resetResultStr = `${time(resetTargetTime.toDate(), "F")} ( in ${durationReset})`;

  // eden
  const targetDayOfWeek = 0;
  const currentDayOfWeek = now.day();
  const daysToAdd = targetDayOfWeek - currentDayOfWeek;
  const edenTargetTime = now.clone().startOf("day").add(daysToAdd, "days");
  if (daysToAdd <= 0 || (daysToAdd === 0 && now.isAfter(edenTargetTime))) {
    edenTargetTime.add(7, "days");
  }
  if (now.isSameOrAfter(edenTargetTime)) {
    edenTargetTime.add(7, "days");
  }
  const durationEden = moment.duration(edenTargetTime.diff(now)).format("d [days] h [hours] mm [minutes] ss [seconds]");
  const edenResultStr = `${time(edenTargetTime.toDate(), "F")} ( in ${durationEden})`;

  // event
  const event = client.skyEvents.get('event');
  const eventDurEnd = moment
    .duration(event.eventEnds.diff(now))
    .format("d [days] h [hours] mm [minutes] ss [seconds]");
  const eventDurStart = moment
    .duration(event.eventStarts.diff(now))
    .format("d [days] h [hours] mm [minutes] ss [seconds]");

  const eventDescription =
    event.eventActive &&
    !now.isAfter(event.eventEnds) &&
    now.isAfter(event.eventStarts)
      ? `${event.eventName} is currently active, and ends on ${time(
          event.eventEnds.toDate(),
          "f",
        )} (in ${eventDurEnd})`
      : event.eventActive && !now.isAfter(event.eventEnds)
      ? `${event.eventName} will start on ${time(
          event.eventStarts.toDate(),
          "f",
        )} (in ${eventDurStart})`
      : "No active events.";

  return {
    geyserResultStr,
    grandmaResultStr,
    resetResultStr,
    edenResultStr,
    turtleResultStr,
    eventDescription,
  };
}

module.exports = { skyTimes };
