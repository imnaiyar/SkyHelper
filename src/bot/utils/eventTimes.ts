import { time } from "discord.js";
import moment from "moment-timezone";
/**
 * Returns all times for events occurence on the their active day
 */
export default (eventTime: moment.Moment, interval?: number) => {
  const clonedTime = eventTime.clone();
  const timeBuilt = [];
  while (eventTime.date() === clonedTime.date()) {
    timeBuilt.push(time(clonedTime.toDate(), "t"));
    clonedTime.add(interval || 0, "minutes");
  }
  return timeBuilt.join(" • ");
};
