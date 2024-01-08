const { time } = require('discord.js');

const createShardInfo = (currentDate, hoursOffset, minutesOffset, secondsOffset, musicTitle) => ({
  earlySky: `Sky colour changes **${hoursOffset} hours**, **${minutesOffset} minutes** and **${secondsOffset} seconds** after reset\nYour time: ${time(currentDate.clone().startOf('day').add(hoursOffset, 'hours').add(minutesOffset, 'minutes').add(secondsOffset, 'seconds').toDate(), 'T')}`,
  gateShard: `Shard crystals appear **${hoursOffset} hours** and **${minutesOffset} minutes** after reset\nYour time: ${time(currentDate.clone().startOf('day').add(hoursOffset, 'hours').add(minutesOffset, 'minutes').toDate(), 't')}`,
  shardLand: `Shard lands **${hoursOffset} hours**, **${minutesOffset} minutes** and **${secondsOffset} seconds** after reset\nYour time: ${time(currentDate.clone().startOf('day').add(hoursOffset, 'hours').add(minutesOffset, 'minutes').add(secondsOffset, 'seconds').toDate(), 'T')}`,
  shardEnd: `Shard ends **${hoursOffset + 4} hours** and **${minutesOffset} minutes** after reset\nYour time: ${time(currentDate.clone().startOf('day').add(hoursOffset + 4, 'hours').add(minutesOffset, 'minutes').toDate(), 't')}`,
  shardMusic: `'${musicTitle}' Music will play during this shard.`,
});

module.exports = (currentDate) => ({
  C: [
    createShardInfo(currentDate, 7, 7, 50, 'Lights Afar'),
    createShardInfo(currentDate, 13, 7, 50, 'Lights Afar'),
    createShardInfo(currentDate, 19, 7, 50, 'Lights Afar'),
  ],
  b: [
    createShardInfo(currentDate, 1, 37, 50, 'An Abrupt Premonition'),
    createShardInfo(currentDate, 9, 37, 50, 'An Abrupt Premonition'),
    createShardInfo(currentDate, 17, 37, 50, 'An Abrupt Premonition'),
  ],
  A: [
    createShardInfo(currentDate, 1, 47, 50, 'Lights Afar'),
    createShardInfo(currentDate, 7, 47, 50, 'Lights Afar'),
    createShardInfo(currentDate, 13, 47, 50, 'Lights Afar'),
  ],
  a: [
    createShardInfo(currentDate, 1, 17, 50, 'An Abrupt Premonition'),
    createShardInfo(currentDate, 9, 17, 50, 'An Abrupt Premonition'),
    createShardInfo(currentDate, 17, 17, 50, 'An Abrupt Premonition'),
  ],
  B: [
    createShardInfo(currentDate, 2, 57, 50, 'Of The Essence'),
    createShardInfo(currentDate, 8, 57, 50, 'Of The Essence'),
    createShardInfo(currentDate, 14, 57, 50, 'Of The Essence'),
  ],
});