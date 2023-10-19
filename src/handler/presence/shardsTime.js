const moment = require('moment-timezone');

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
function shardsTime() {
  const timezone = 'America/Los_Angeles';

  let currentDate;
  let dayOfMonth;

  currentDate = moment().tz(timezone);
  dayOfMonth = currentDate.date();
  dayOfWeek = currentDate.day();
  formatDate = currentDate.format('DD MMMM YYYY');

  // Calculate the index in the event sequences
  const sequenceIndex = (dayOfMonth - 1) % eventSequence.length;
  const currentEvent = eventSequence[sequenceIndex];

  if (
    (currentEvent === 'a' && [6, 0].includes(dayOfWeek)) ||
    (currentEvent === 'A' && [2, 3].includes(dayOfWeek)) ||
    (currentEvent === 'b' && [0, 1].includes(dayOfWeek)) ||
    (currentEvent === 'B' && [3, 4].includes(dayOfWeek)) ||
    (currentEvent === 'C' && [1, 2].includes(dayOfWeek))
  ) {
    return '🌋 There is no shard today.';
  }

  function getOrdinalSuffix(number) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const remainder10 = number % 10;
    const remainder100 = number % 100;

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
  const eventTimingsC = [
    {
      start: currentDate
        .clone()
        .startOf('day')
        .add(7, 'hours')
        .add(48, 'minutes')
        .add(40, 'seconds'),
      end: currentDate
        .clone()
        .startOf('day')
        .add(11, 'hours')
        .add(40, 'minutes'),
    },
    {
      start: currentDate
        .clone()
        .startOf('day')
        .add(13, 'hours')
        .add(48, 'minutes')
        .add(40, 'seconds'),
      end: currentDate
        .clone()
        .startOf('day')
        .add(17, 'hours')
        .add(40, 'minutes'),
    },
    {
      start: currentDate
        .clone()
        .startOf('day')
        .add(19, 'hours')
        .add(48, 'minutes')
        .add(40, 'seconds'),
      end: currentDate
        .clone()
        .startOf('day')
        .add(23, 'hours')
        .add(40, 'minutes'),
    },
  ];

  const eventTimingsA = [
    {
      start: currentDate
        .clone()
        .startOf('day')
        .add(2, 'hours')
        .add(28, 'minutes')
        .add(40, 'seconds'),
      end: currentDate
        .clone()
        .startOf('day')
        .add(6, 'hours')
        .add(20, 'minutes'),
    },
    {
      start: currentDate
        .clone()
        .startOf('day')
        .add(8, 'hours')
        .add(28, 'minutes')
        .add(40, 'seconds'),
      end: currentDate
        .clone()
        .startOf('day')
        .add(12, 'hours')
        .add(20, 'minutes'),
    },
    {
      start: currentDate
        .clone()
        .startOf('day')
        .add(14, 'hours')
        .add(28, 'minutes')
        .add(40, 'seconds'),
      end: currentDate
        .clone()
        .startOf('day')
        .add(18, 'hours')
        .add(20, 'minutes'),
    },
  ];

  const eventTimingsa = [
    {
      start: currentDate
        .clone()
        .startOf('day')
        .add(1, 'hours')
        .add(58, 'minutes')
        .add(40, 'seconds'),
      end: currentDate
        .clone()
        .startOf('day')
        .add(5, 'hours')
        .add(50, 'minutes'),
    },
    {
      start: currentDate
        .clone()
        .startOf('day')
        .add(9, 'hours')
        .add(58, 'minutes')
        .add(40, 'seconds'),
      end: currentDate
        .clone()
        .startOf('day')
        .add(13, 'hours')
        .add(50, 'minutes'),
    },
    {
      start: currentDate
        .clone()
        .startOf('day')
        .add(17, 'hours')
        .add(58, 'minutes')
        .add(40, 'seconds'),
      end: currentDate
        .clone()
        .startOf('day')
        .add(21, 'hours')
        .add(50, 'minutes'),
    },
  ];

  const eventTimingsB = [
    {
      start: currentDate
        .clone()
        .startOf('day')
        .add(3, 'hours')
        .add(38, 'minutes')
        .add(40, 'seconds'),
      end: currentDate
        .clone()
        .startOf('day')
        .add(7, 'hours')
        .add(30, 'minutes'),
    },
    {
      start: currentDate
        .clone()
        .startOf('day')
        .add(9, 'hours')
        .add(38, 'minutes')
        .add(40, 'seconds'),
      end: currentDate
        .clone()
        .startOf('day')
        .add(13, 'hours')
        .add(30, 'minutes'),
    },
    {
      start: currentDate
        .clone()
        .startOf('day')
        .add(15, 'hours')
        .add(38, 'minutes')
        .add(40, 'seconds'),
      end: currentDate
        .clone()
        .startOf('day')
        .add(19, 'hours')
        .add(30, 'minutes'),
    },
  ];

  const eventTimingsb = [
    {
      start: currentDate
        .clone()
        .startOf('day')
        .add(2, 'hours')
        .add(18, 'minutes')
        .add(40, 'seconds'),
      end: currentDate
        .clone()
        .startOf('day')
        .add(6, 'hours')
        .add(10, 'minutes'),
    },
    {
      start: currentDate
        .clone()
        .startOf('day')
        .add(10, 'hours')
        .add(18, 'minutes')
        .add(40, 'seconds'),
      end: currentDate
        .clone()
        .startOf('day')
        .add(14, 'hours')
        .add(10, 'minutes'),
    },
    {
      start: currentDate
        .clone()
        .startOf('day')
        .add(18, 'hours')
        .add(18, 'minutes')
        .add(40, 'seconds'),
      end: currentDate
        .clone()
        .startOf('day')
        .add(22, 'hours')
        .add(10, 'minutes'),
    },
  ];
  let eventTimings;
  let type;
  if (currentEvent === 'A') {
    eventTimings = eventTimingsA;
    type = 'Red';
  } else if (currentEvent === 'B') {
    eventTimings = eventTimingsB;
    type = 'Red';
  } else if (currentEvent === 'C') {
    eventTimings = eventTimingsC;
    type = 'Red';
  } else if (currentEvent === 'a') {
    eventTimings = eventTimingsa;
    type = 'Black';
  } else if (currentEvent === 'b') {
    eventTimings = eventTimingsb;
    type = 'Black';
  }

  let eventStatus = '';
  let timeRemaining = '';

  for (let i = 0; i < eventTimings.length; i++) {
    const eventTiming = eventTimings[i];
    const present = moment().tz(timezone);

    if (present.isBetween(eventTiming.start, eventTiming.end)) {
      eventStatus = `🌋 ${i + 1}${getOrdinalSuffix(i + 1)} ${type} shard`;
      const duration = moment.duration(eventTiming.end.diff(present));
      timeRemaining = `ends in ${duration.hours()}h ${duration.minutes()}m`;
      break;
    } else if (present.isBefore(eventTiming.start)) {
      eventStatus = `🌋 ${i + 1}${getOrdinalSuffix(
        i + 1,
      )} ${type} shard lands in`;
      const duration = moment.duration(eventTiming.start.diff(present));
      const hoursRemaining = Math.floor(duration.asHours());
      const minutesRemaining = Math.floor(duration.asMinutes()) % 60;
      timeRemaining = `${hoursRemaining}h ${minutesRemaining}m`;
      break;
    } else if (
      i < eventTimings.length - 1 &&
      present.isAfter(eventTiming.end) &&
      present.isBefore(eventTimings[i + 1].start)
    ) {
      const duration = moment.duration(eventTimings[i + 1].start.diff(present));
      eventStatus = `🌋 ${i + 2}${getOrdinalSuffix(i + 2)} ${type} shard lands`;
      timeRemaining = `in ${duration.hours()}h ${duration.minutes()}m`;
      break;
    } else if (
      i === eventTimings.length - 1 &&
      present.isAfter(eventTiming.end)
    ) {
      eventStatus = `🌋 All Shards Has Ended For Today.`;
      timeRemaining = '';
      break;
    }
  }
  const status = `${eventStatus} ${timeRemaining}`;
  return status;
}

module.exports = { shardsTime };
