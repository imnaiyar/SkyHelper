import { getEvent } from "#schemas/Event";
import type { EventType } from "#libs/types";
import moment from "moment-timezone";

type T = EventType | string;
export default async (): Promise<T> => {
  const data = await getEvent();
  const { startDate, endDate, name } = data;
  const now = moment().tz("America/Los_Angeles");
  const start = moment.tz(startDate, "DD-MM-YYYY", "America/Los_Angeles").startOf("day");
  const end = moment.tz(endDate, "DD-MM-YYYY", "America/Los_Angeles").endOf("day");
  if (now.isBetween(start, end)) {
    return {
      active: true,
      name: name,
      start: start,
      end: end,
      duration: moment.duration(end.diff(now)).format("d[d] h[h] m[m] s[s]"),
      days: moment.duration(end.diff(start)).days(),
    };
  } else if (now.isBefore(start)) {
    return {
      active: false,
      name: name,
      start: start,
      end: end,
      duration: moment.duration(start.diff(now)).format("d[d] h[h] m[m] s[s]"),
      days: moment.duration(end.diff(start)).days(),
    };
  } else {
    return "No Events";
  }
};
