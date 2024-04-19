import { Times } from "#libs/types";
import moment from "moment-timezone";

export default (offset: number): Times => {
  const now = moment().tz("America/Los_Angeles");
  const start = now.clone().startOf("day").add(offset, "minutes");
  const end = start.clone().add(15, "minute");
  while (start.isBefore(now) && end.isBefore(now)) {
    start.add(2, "hours");
    end.add(2, "hours");
  }
  if (now.isBetween(start, end)) {
    return {
      active: true,
      startTime: start,
      endTime: end,
      nextTime: start.clone().add(2, "hours"),
      duration: moment.duration(end.diff(now)).format("d[d] h[h] m[m] s[s]"),
    };
  } else {
    return {
      active: false,
      nextTime: start,
      duration: moment.duration(start.diff(now)).format("d[d] h[h] m[m] s[s]"),
    };
  }
};
