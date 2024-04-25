import moment from "moment-timezone";

/**
 * Returns shards fall - end times for a givent date
 */
export default (currentDate: moment.Moment) => {
  const getTimes = (
    earlySkyHours: number,
    earlySkyMinutes: number,
    earlySkySeconds: number,
    gateShardHours: number,
    gateShardMinutes: number,
    shardLandHours: number,
    shardLandMinutes: number,
    shardLandSeconds: number,
    shardEndHours: number,
    shardEndMinutes: number,
    shardMusic: string,
  ) => {
    return {
      earlySky: currentDate
        .clone()
        .startOf("day")
        .add(earlySkyHours, "hours")
        .add(earlySkyMinutes, "minutes")
        .add(earlySkySeconds, "seconds"),
      gateShard: currentDate.clone().startOf("day").add(gateShardHours, "hours").add(gateShardMinutes, "minutes"),
      start: currentDate
        .clone()
        .startOf("day")
        .add(shardLandHours, "hours")
        .add(shardLandMinutes, "minutes")
        .add(shardLandSeconds, "seconds"),
      end: currentDate.clone().startOf("day").add(shardEndHours, "hours").add(shardEndMinutes, "minutes"),
      shardMusic: shardMusic,
    } as const;
  };

  return {
    C: [
      getTimes(7, 7, 50, 7, 40, 7, 48, 40, 11, 40, "Lights Afar"),
      getTimes(13, 7, 50, 13, 40, 13, 48, 40, 17, 40, "Lights Afar"),
      getTimes(19, 7, 50, 19, 40, 19, 48, 40, 23, 40, "Lights Afar"),
    ],
    b: [
      getTimes(1, 37, 50, 2, 10, 2, 18, 40, 6, 10, "An Abrupt Premonition"),
      getTimes(9, 37, 50, 10, 10, 10, 18, 40, 14, 10, "An Abrupt Premonition"),
      getTimes(17, 37, 50, 18, 10, 18, 18, 40, 22, 10, "An Abrupt Premonition"),
    ],
    A: [
      getTimes(1, 47, 50, 2, 20, 2, 28, 40, 6, 20, "Lights Afar"),
      getTimes(7, 47, 50, 8, 20, 8, 28, 40, 12, 20, "Lights Afar"),
      getTimes(13, 47, 50, 14, 20, 14, 28, 40, 18, 20, "Lights Afar"),
    ],
    a: [
      getTimes(1, 17, 50, 1, 50, 1, 58, 40, 5, 50, "An Abrupt Premonition"),
      getTimes(9, 17, 50, 9, 50, 9, 58, 40, 13, 50, "An Abrupt Premonition"),
      getTimes(17, 17, 50, 17, 50, 17, 58, 40, 21, 50, "An Abrupt Premonition"),
    ],
    B: [
      getTimes(2, 57, 50, 3, 30, 3, 38, 40, 7, 30, "Of The Essence"),
      getTimes(8, 57, 50, 9, 30, 9, 38, 40, 13, 30, "Of The Essence"),
      getTimes(14, 57, 50, 15, 30, 15, 38, 40, 19, 30, "Of The Essence"),
    ],
  };
};
