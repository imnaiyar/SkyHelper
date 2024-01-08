const { time } = require('discord.js');

module.exports = (currentDate) => {
 return {
  C: [
    {
      title: '1st Shard',
      earlySky:
        `Sky colour of all the realm changes once the shard nears landing. These changes happen **7 hours**, **07 minutes** and **50 seconds** after reset\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(7, 'hours')
          .add(07, 'minutes')
          .add(50, 'seconds').toDate(), 'T')}`,
      gateShard:
        `Shard crystals on realm doors indicating their location. They appear **7 hours** and **40 minutes** after reset.\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(7, 'hours')
          .add(40, 'minutes').toDate(), 't')}`,
      shardLand:
        `1st shard lands **7 hours**, **48 minutes** and **40 seconds** after reset\nYour Time: ${time(currentDate.clone()
          .startOf('day')
          .add(7, 'hours')
          .add(48, 'minutes')
          .add(40, 'seconds').toDate(), 'T')}`,
      shardEnd:
        `1st shard ends **11 hours** and **40 minutes** after reset.\n Your time: ${time(currentDate.clone()
          .startOf('day')
          .add(11, 'hours')
          .add(40, 'minutes').toDate(), 't')}`,
      shardMusic: "'**Lights Afar**' Music will play during this shard.",
    },
    {
      title: '2nd Shard',
      earlySky:
        `Sky color of all the realm changes once the shard nears landing. These changes happen **13 hours**, **07 minutes** and **50 seconds** after reset.\nYour Time: ${time(currentDate.clone()
          .startOf('day')
          .add(13, 'hours')
          .add(07, 'minutes')
          .add(50, 'seconds').toDate(), 'T')}`,
      gateShard:
        `Shard crystals on realm doors indicating their location. They appear **13 hours** and **40 minutes** after reset\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(13, 'hours')
          .add(40, 'minutes').toDate(), 't')}`,
      shardLand:
        `2nd shard lands **13 hours**, **48 minutes** and **40 seconds** after reset.\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(13, 'hours')
          .add(48, 'minutes')
          .add(40, 'seconds').toDate(), 'T')}`
        ,
      shardEnd:
        `2nd Shard ends **17 hours** and **40 minutes** after reset. \nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(17, 'hours')
          .add(40, 'minutes').toDate(), 't')}`,
      shardMusic: "'Lights Afar' Music will play during this shard.",
    },
    {
      title: '3rd Shard',
      earlySky:
        `Sky color of all the realm changes once the shard nears landing. These changes happen **19 hours**, **07 minutes** and **50 seconds** after reset.\nYour Time: ${time(currentDate.clone()
          .startOf('day')
          .add(19, 'hours')
          .add(07, 'minutes')
          .add(50, 'seconds').toDate(), 'T')}`,
      gateShard:
        `Shard crystals on realm doors indicating their location. They appear **19 hours** and **40 minutes** after reset.\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(19, 'hours')
          .add(40, 'minutes').toDate(), 't')}`,
      shardLand:
        `3rd shard lands **19 hours**, **48 minutes** and **40 seconds** after reset.\nYour Time: ${time(currentDate.clone()
          .startOf('day')
          .add(19, 'hours')
          .add(48, 'minutes')
          .add(40, 'seconds').toDate(), 'T')}`,
      shardEnd:
        `All shards ends **23 hours** and **40 minutes** after reset\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(23, 'hours')
          .add(40, 'minutes').toDate(), 'T')}`,
      shardMusic: "'Lights Afar' Music will play during this shard.",
    },
  ],
  b: [
    {
      title: '1st Shard',
      earlySky:
        `Sky colour of all the realm changes once the shard nears landing. These changes happen **1 hour**, **37 minutes** and **50 seconds** after reset\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(1, 'hour')
          .add(37, 'minutes')
          .add(50, 'seconds').toDate(), 'T')}`,
      gateShard:
        `Shard crystals on realm doors indicating their location. They appear **2 hours** and **10 minutes** after reset.\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(2, 'hours')
          .add(10, 'minutes').toDate(), 't')}`,
      shardLand:
        `1st shard lands **2 hours**, **18 minutes** and **40 seconds** after reset\nYour Time: ${time(currentDate.clone()
          .startOf('day')
          .add(2, 'hours')
          .add(18, 'minutes')
          .add(40, 'seconds').toDate(), 'T')}`,
      shardEnd:
        `1st Shard ends **6 hours** and **10 minutes** after reset  \nYour time:${time(currentDate.clone()
          .startOf('day')
          .add(6, 'hours')
          .add(10, 'minutes').toDate(), 't')}`,
      shardMusic:
        "'**An Abrupt Premonition**' Music will play during this shard.",
    },
    {
      title: '2nd Shard ',
      earlySky:
        `Sky colour of all the realm changes once the shard nears landing. These changes happen **9 hours**, **37 minutes** and **50 seconds** after reset\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(9, 'hours')
          .add(37, 'minutes')
          .add(50, 'seconds').toDate(), 'T')}`,
      gateShard:
        `Shard crystals on realm doors indicating their location. They appear **10 hours** and **10 minutes** after reset.\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(10, 'hours')
          .add(10, 'minutes').toDate(), 't')}`,
      shardLand:
        `2nd shard lands **10 hours**, **18 minutes** and **40 seconds** after reset\nYour Time: ${time(currentDate.clone()
          .startOf('day')
          .add(10, 'hours')
          .add(18, 'minutes')
          .add(40, 'seconds').toDate(), 'T')}`,
      shardEnd:
        `2nd Shard ends **14 hours** and **10 minutes** after reset.\nYour time:${time(currentDate.clone()
          .startOf('day')
          .add(14, 'hours')
          .add(10, 'minutes').toDate(), 't')}`,
      shardMusic:
        "'**An Abrupt Premonition**' Music will play during this shard.",
    },
    {
      title: '3rd Shard ',
      earlySky:
        `Sky colour of all the realm changes once the shard nears landing. These changes happen **17 hours**, **37 minutes** and **50 seconds** after reset\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(17, 'hours')
          .add(37, 'minutes')
          .add(50, 'seconds').toDate(), 'T')}`,
      gateShard:
        `Shard crystals on realm doors indicating their location. They appear **18 hours** and **10 minutes** after reset.\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(18, 'hours')
          .add(10, 'minutes').toDate(), 't')}`,
      shardLand:
        `3rd shard lands **18 hours**, **18 minutes** and **40 seconds** after reset\nYour Time: ${time(currentDate.clone()
          .startOf('day')
          .add(18, 'hours')
          .add(18, 'minutes')
          .add(40, 'seconds').toDate(), 'T')}`,
      shardEnd:
        `3rd Shard ends **22 hours** and **10 minutes** after reset.\nYour time:${time(currentDate.clone()
          .startOf('day')
          .add(22, 'hours')
          .add(10, 'minutes').toDate(), 't')}`,
      shardMusic:
        "'**An Abrupt Premonition**' Music will play during this shard.",
    },
  ],
  A: [
    {
      title: '1st Shard',
      earlySky:
        `Sky colour of all the realm changes once the shard nears landing. These changes happen **1 hour**, **47 minutes** and **50 seconds** after reset\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(1, 'hour')
          .add(47, 'minutes')
          .add(50, 'seconds').toDate(), 'T')}`,
      gateShard:
        `Shard crystals on realm doors indicating their location. They appear **2 hours** and **20 minutes** after reset.\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(2, 'hours')
          .add(20, 'minutes').toDate(), 't')}`,
      shardLand:
        `1st shard lands **2 hours**, **28 minutes** and **40 seconds** after reset\nYour Time: ${time(currentDate.clone()
          .startOf('day')
          .add(2, 'hours')
          .add(28, 'minutes')
          .add(40, 'seconds').toDate(), 'T')}`,
      shardEnd:
        `1st Shard ends **6 hours** and **20 minutes** after reset.\nYour time:${time(currentDate.clone()
          .startOf('day')
          .add(6, 'hours')
          .add(20, 'minutes').toDate(), 't')}`,
      shardMusic: "'**Lights Afar**' Music will play during this shard.",
    },
    {
      title: '2nd Shard',
      earlySky:
        `Sky colour of all the realm changes once the shard nears landing. These changes happen **7 hours**, **47 minutes** and **50 seconds** after reset\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(7, 'hours')
          .add(47, 'minutes')
          .add(50, 'seconds').toDate(), 'T')}`,
      gateShard:
        `Shard crystals on realm doors indicating their location. They appear **8 hours** and **20 minutes** after reset.\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(8, 'hours')
          .add(20, 'minutes').toDate(), 't')}`,
      shardLand:
        `2nd shard lands **8 hours**, **28 minutes** and **40 seconds** after reset\nYour Time: ${time(currentDate.clone()
          .startOf('day')
          .add(8, 'hours')
          .add(28, 'minutes')
          .add(40, 'seconds').toDate(), 'T')}`,
      shardEnd:
        `2nd Shard ends **12 hours** and **20 minutes** after reset.\nYour time:${time(currentDate.clone()
          .startOf('day')
          .add(12, 'hours')
          .add(20, 'minutes').toDate(), 't')}`,
      shardMusic: "'**Lights Afar**' Music will play during this shard.",
    },
    {
      title: '3rd Shard',
      earlySky:
        `Sky colour of all the realm changes once the shard nears landing. These changes happen **13 hours**, **47 minutes** and **50 seconds** after reset\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(13, 'hours')
          .add(47, 'minutes')
          .add(50, 'seconds').toDate(), 'T')}`,
      gateShard:
        `Shard crystals on realm doors indicating their location. They appear **14 hours** and **20 minutes** after reset.\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(14, 'hours')
          .add(20, 'minutes').toDate(), 't')}`,
      shardLand:
        `3rd shard lands **14 hours**, **28 minutes** and **40 seconds** after reset\nYour Time: ${time(currentDate.clone()
          .startOf('day')
          .add(14, 'hours')
          .add(28, 'minutes')
          .add(40, 'seconds').toDate(), 'T')}`,
      shardEnd:
        `3rd Shard ends **18 hours** and **20 minutes** after reset.\nYour time:${time(currentDate.clone()
          .startOf('day')
          .add(18, 'hours')
          .add(20, 'minutes').toDate(), 't')}`,
      shardMusic: "'**Lights Afar**' Music will play during this shard.",
    },
  ],
  a: [
    {
      title: '1st Shard ',
      earlySky:
        `Sky colour of all the realm changes once the shard nears landing. These changes happen **1 hour**, **17 minutes** and **50 seconds** after reset\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(1, 'hour')
          .add(17, 'minutes')
          .add(50, 'seconds').toDate(), 'T')}`,
      gateShard:
        `Shard crystals on realm doors indicating their location. They appear **1 hour** and **50 minutes** after reset.\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(1, 'hour')
          .add(50, 'minutes').toDate(), 't')}`,
      shardLand:
        `1st shard lands **1 hour**, **58 minutes** and **40 seconds** after reset\nYour Time: ${time(currentDate.clone()
          .startOf('day')
          .add(1, 'hour')
          .add(58, 'minutes')
          .add(40, 'seconds').toDate(), 'T')}`,
      shardEnd:
        `1st Shard ends **5 hours** and **50 minutes** after reset.\nYour time:${time(currentDate.clone()
          .startOf('day')
          .add(5, 'hours')
          .add(50, 'minutes').toDate(), 't')}`,
      shardMusic:
        "'**An Abrupt Premonition**' Music will play during this shard.",
    },
    {
      title: '2nd Shard ',
      earlySky:
        `Sky colour of all the realm changes once the shard nears landing. These changes happen **9 hours**, **17 minutes** and **50 seconds** after reset\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(9, 'hours')
          .add(17, 'minutes')
          .add(50, 'seconds').toDate(), 'T')}`,
      gateShard:
        `Shard crystals on realm doors indicating their location. They appear **9 hours** and **50 minutes** after reset.\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(9, 'hours')
          .add(50, 'minutes').toDate(), 't')}`,
      shardLand:
        `2nd shard lands **9 hours**, **58 minutes** and **40 seconds** after reset\nYour Time: ${time(currentDate.clone()
          .startOf('day')
          .add(9, 'hours')
          .add(58, 'minutes')
          .add(40, 'seconds').toDate(), 'T')}`,
      shardEnd:
        `2nd Shard ends **13 hours** and **50 minutes** after reset.\nYour time:${time(currentDate.clone()
          .startOf('day')
          .add(13, 'hours')
          .add(50, 'minutes').toDate(), 't')}`,
      shardMusic:
        "'**An Abrupt Premonition**' Music will play during this shard.",
    },
    {
      title: '3rd Shard ',
      earlySky:
        `Sky colour of all the realm changes once the shard nears landing. These changes happen **17 hours**, **17 minutes** and **50 seconds** after reset\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(17, 'hours')
          .add(17, 'minutes')
          .add(50, 'seconds').toDate(), 'T')}`,
      gateShard:
        `Shard crystals on realm doors indicating their location. They appear **17 hours** and **50 minutes** after reset.\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(17, 'hours')
          .add(50, 'minutes').toDate(), 't')}`,
      shardLand:
        `3rd shard lands **17 hours**, **58 minutes** and **40 seconds** after reset\nYour Time: ${time(currentDate.clone()
          .startOf('day')
          .add(17, 'hours')
          .add(58, 'minutes')
          .add(40, 'seconds').toDate(), 'T')}`,
      shardEnd:
        `3rd Shard ends **21 hours** and **50 minutes** after reset. \nYour time:${time(currentDate.clone()
          .startOf('day')
          .add(21, 'hours')
          .add(50, 'minutes').toDate(), 't')}`,
      shardMusic:
        "'**An Abrupt Premonition**' Music will play during this shard.",
    },
  ],
  B: [
    {
      title: '1st Shard ',
      earlySky:
        `Sky colour of all the realm changes once the shard nears landing. These changes happen **2 hours**, **57 minutes** and **50 seconds** after reset\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(2, 'hours')
          .add(57, 'minutes')
          .add(50, 'seconds').toDate(), 'T')}`,
      gateShard:
        `Shard crystals on realm doors indicating their location. They appear **3 hours** and **30 minutes** after reset.\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(3, 'hours')
          .add(30, 'minutes').toDate(), 't')}`,
      shardLand:
        `1st shard lands **3 hours**, **38 minutes** and **40 seconds** after reset\nYour Time: ${time(currentDate.clone()
          .startOf('day')
          .add(3, 'hours')
          .add(38, 'minutes')
          .add(40, 'seconds').toDate(), 'T')}`,
      shardEnd:
        `1st Shard ends **7 hours** and **30 minutes**.\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(7, 'hours')
          .add(30, 'minutes').toDate(), 't')}`,
      shardMusic: "'**Of The Essence**' Music will play during this shard.",
    },
    {
      title: '2nd Shard ',
      earlySky:
        `Sky colour of all the realm changes once the shard nears landing. These changes happen **8 hours**, **57 minutes** and **50 seconds** after reset\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(8, 'hours')
          .add(57, 'minutes')
          .add(50, 'seconds').toDate(), 'T')}`,
      gateShard:
        `Shard crystals on realm doors indicating their location. They appear **9 hours** and **30 minutes** after reset.\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(9, 'hours')
          .add(30, 'minutes').toDate(), 't')}`,
      shardLand:
        `2nd shard lands **9 hours**, **38 minutes** and **40 seconds** after reset\nYour Time: ${time(currentDate.clone()
          .startOf('day')
          .add(9, 'hours')
          .add(38, 'minutes')
          .add(40, 'seconds').toDate(), 'T')}`,
      shardEnd:
        `2nd Shard ends **13 hours** and **30 minutes** after reset.\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(13, 'hours')
          .add(30, 'minutes').toDate(), 't')}`,
      shardMusic: "'**Of The Essence**' Music will play during this shard.",
    },
    {
      title: '3rd Shard ',
      earlySky:
        `Sky colour of all the realm changes once the shard nears landing. These changes happen **14 hours**, **57 minutes** and **50 seconds** after reset\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(14, 'hours')
          .add(57, 'minutes')
          .add(50, 'seconds').toDate(), 'T')}`,
      gateShard:
        `Shard crystals on realm doors indicating their location. They appear **15 hours** and **30 minutes** after reset.\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(15, 'hours')
          .add(30, 'minutes').toDate(), 't')}`,
      shardLand:
        `3rd shard lands **15 hours**, **38 minutes** and **40 seconds** after reset\nYour Time: ${time(currentDate.clone()
          .startOf('day')
          .add(15, 'hours')
          .add(38, 'minutes')
          .add(40, 'seconds').toDate(), 'T')}`,
      shardEnd:
        `3rd Shard ends **19 hours** and **30 minutes** after reset.\nYour time: ${time(currentDate.clone()
          .startOf('day')
          .add(19, 'hours')
          .add(30, 'minutes').toDate(), 't')}`,
      shardMusic: "'**Of The Essence**' Music will play during this shard.",
    },
  ],

 };
};