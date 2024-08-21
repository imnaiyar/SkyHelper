import { type Times } from "#bot/libs/types";
import moment from "moment-timezone";
export function getEventStatus(offset: number, interval: number): Times {
  const now = moment().tz("America/Los_Angeles");
  const start = now.clone().startOf("day").add(offset, "minutes");
  const end = start.clone().add(15, "minute");
  while (start.isBefore(now) && end.isBefore(now)) {
    start.add(interval, "hours");
    end.add(interval, "hours");
  }
  if (now.isBetween(start, end)) {
    return {
      active: true,
      startTime: start,
      endTime: end,
      nextTime: start.clone().add(interval, "hours"),
      duration: moment.duration(end.diff(now)).format("d[d] h[h] m[m] s[s]"),
    };
  } else {
    return {
      active: false,
      nextTime: start,
      duration: moment.duration(start.diff(now)).format("d[d] h[h] m[m] s[s]"),
    };
  }
}

