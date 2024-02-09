const { time } = require("discord.js");

/**
 * @param {Date} currentDate
 * @returns
 */
module.exports = (currentDate) => {
  const getTime = (hours, minutes, seconds) => {
    return time(
      currentDate.clone().startOf("day").add(hours, "hours").add(minutes, "minutes").add(seconds, "seconds").toDate(),
      seconds > 0 ? "T" : "t"
    );
  };

  const createShard = (
    title,
    earlySkyHours,
    earlySkyMinutes,
    earlySkySeconds,
    gateShardHours,
    gateShardMinutes,
    shardLandHours,
    shardLandMinutes,
    shardLandSeconds,
    shardEndHours,
    shardEndMinutes,
    shardMusic
  ) => {
    return {
      title,
      earlySky: `Sky colour changes at: ${getTime(earlySkyHours, earlySkyMinutes, earlySkySeconds)}`,
      gateShard: `Shards crystal on gate appears at: ${getTime(gateShardHours, gateShardMinutes, 0)}`,
      shardLand: `Shard lands at: ${getTime(shardLandHours, shardLandMinutes, shardLandSeconds)}`,
      shardEnd: `Shard ends at: ${getTime(shardEndHours, shardEndMinutes, 0)}`,
      shardMusic: `${shardMusic} will play during this shard`,
    };
  };

  return {
    C: [
      createShard("1st Shard", 7, 7, 50, 7, 40, 7, 48, 40, 11, 40, "'Lights Afar' music"),
      createShard("2nd Shard", 13, 7, 50, 13, 40, 13, 48, 40, 17, 40, "'Lights Afar' music"),
      createShard("3rd Shard", 19, 7, 50, 19, 40, 19, 48, 40, 23, 40, "'Lights Afar' music"),
    ],
    b: [
      createShard("1st Shard", 1, 37, 50, 2, 10, 2, 18, 40, 6, 10, "'An Abrupt Premonition' music"),
      createShard("2nd Shard", 9, 37, 50, 10, 10, 10, 18, 40, 14, 10, "'An Abrupt Premonition' music"),
      createShard("3rd Shard", 17, 37, 50, 18, 10, 18, 18, 40, 22, 10, "'An Abrupt Premonition' music"),
    ],
    A: [
      createShard("1st Shard", 1, 47, 50, 2, 20, 2, 28, 40, 6, 20, "'Lights Afar' music"),
      createShard("2nd Shard", 7, 47, 50, 8, 20, 8, 28, 40, 12, 20, "'Lights Afar' music"),
      createShard("3rd Shard", 13, 47, 50, 14, 20, 14, 28, 40, 18, 20, "'Lights Afar' music"),
    ],
    a: [
      createShard("1st Shard", 1, 17, 50, 1, 50, 1, 58, 40, 5, 50, "'An Abrupt Premonition' music"),
      createShard("2nd Shard", 9, 17, 50, 9, 50, 9, 58, 40, 13, 50, "'An Abrupt Premonition' music"),
      createShard("3rd Shard", 17, 17, 50, 17, 50, 17, 58, 40, 21, 50, "'An Abrupt Premonition' music"),
    ],
    B: [
      createShard("1st Shard", 2, 57, 50, 3, 30, 3, 38, 40, 7, 30, "'Of The Essence' music"),
      createShard("2nd Shard", 8, 57, 50, 9, 30, 9, 38, 40, 13, 30, "'Of The Essence' music"),
      createShard("3rd Shard", 14, 57, 50, 15, 30, 15, 38, 40, 19, 30, "'Of The Essence' music"),
    ],
  };
};
