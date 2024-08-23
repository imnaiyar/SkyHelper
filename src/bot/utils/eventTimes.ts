import { time } from "discord.js";
import moment from "moment-timezone";
import { eventData } from "../libs/index.js";
import { getOccurenceDay } from "./getEventOccurences.js";
/**
 * Returns all times for events in a day
 */
export default () => {
  const buildTimestamps = (eventTime: moment.Moment, interval?: number) => {
    const clonedTime = eventTime.clone();
    const timeBuilt = [];
    while (eventTime.date() === clonedTime.date()) {
      timeBuilt.push(time(clonedTime.toDate(), "t"));
      clonedTime.add(interval || 0, "minutes");
    }
    return timeBuilt.join(" • ");
  };
  const occurences: Record<keyof typeof eventData, string> = {};
  Object.entries(eventData).forEach(([k, v]) => {
    const occurenceDay = getOccurenceDay(v);
    occurences[k] = buildTimestamps(occurenceDay, v.interval);
  });
  return occurences;
};
