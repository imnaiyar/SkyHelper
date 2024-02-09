/**
 * Returns shards fall - end times for a givent date
 * @param {import('moment').Moment} currentDate
 * @returns
 */
module.exports = (currentDate) => {
  return {
    C: [
      {
        start: currentDate.clone().startOf("day").add(7, "hours").add(48, "minutes").add(40, "seconds"),
        end: currentDate.clone().startOf("day").add(11, "hours").add(40, "minutes"),
      },
      {
        start: currentDate.clone().startOf("day").add(13, "hours").add(48, "minutes").add(40, "seconds"),
        end: currentDate.clone().startOf("day").add(17, "hours").add(40, "minutes"),
      },
      {
        start: currentDate.clone().startOf("day").add(19, "hours").add(48, "minutes").add(40, "seconds"),
        end: currentDate.clone().startOf("day").add(23, "hours").add(40, "minutes"),
      },
    ],
    A: [
      {
        start: currentDate.clone().startOf("day").add(2, "hours").add(28, "minutes").add(40, "seconds"),
        end: currentDate.clone().startOf("day").add(6, "hours").add(20, "minutes"),
      },
      {
        start: currentDate.clone().startOf("day").add(8, "hours").add(28, "minutes").add(40, "seconds"),
        end: currentDate.clone().startOf("day").add(12, "hours").add(20, "minutes"),
      },
      {
        start: currentDate.clone().startOf("day").add(14, "hours").add(28, "minutes").add(40, "seconds"),
        end: currentDate.clone().startOf("day").add(18, "hours").add(20, "minutes"),
      },
    ],
    a: [
      {
        start: currentDate.clone().startOf("day").add(1, "hours").add(58, "minutes").add(40, "seconds"),
        end: currentDate.clone().startOf("day").add(5, "hours").add(50, "minutes"),
      },
      {
        start: currentDate.clone().startOf("day").add(9, "hours").add(58, "minutes").add(40, "seconds"),
        end: currentDate.clone().startOf("day").add(13, "hours").add(50, "minutes"),
      },
      {
        start: currentDate.clone().startOf("day").add(17, "hours").add(58, "minutes").add(40, "seconds"),
        end: currentDate.clone().startOf("day").add(21, "hours").add(50, "minutes"),
      },
    ],
    B: [
      {
        start: currentDate.clone().startOf("day").add(3, "hours").add(38, "minutes").add(40, "seconds"),
        end: currentDate.clone().startOf("day").add(7, "hours").add(30, "minutes"),
      },
      {
        start: currentDate.clone().startOf("day").add(9, "hours").add(38, "minutes").add(40, "seconds"),
        end: currentDate.clone().startOf("day").add(13, "hours").add(30, "minutes"),
      },
      {
        start: currentDate.clone().startOf("day").add(15, "hours").add(38, "minutes").add(40, "seconds"),
        end: currentDate.clone().startOf("day").add(19, "hours").add(30, "minutes"),
      },
    ],
    b: [
      {
        start: currentDate.clone().startOf("day").add(2, "hours").add(18, "minutes").add(40, "seconds"),
        end: currentDate.clone().startOf("day").add(6, "hours").add(10, "minutes"),
      },
      {
        start: currentDate.clone().startOf("day").add(10, "hours").add(18, "minutes").add(40, "seconds"),
        end: currentDate.clone().startOf("day").add(14, "hours").add(10, "minutes"),
      },
      {
        start: currentDate.clone().startOf("day").add(18, "hours").add(18, "minutes").add(40, "seconds"),
        end: currentDate.clone().startOf("day").add(22, "hours").add(10, "minutes"),
      },
    ],
  };
};
