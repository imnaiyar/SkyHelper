import moment from "moment-timezone";
import { eventData } from "#bot/libs/index";
type EventKey = keyof typeof eventData;
export const getOccurenceDay = (event: (typeof eventData)[EventKey]) => {
  const nextOccurrence = moment().tz("America/Los_Angeles").startOf("day").add(event.offset, "minutes"); // Start with the offset from the beginning of the day

  if (event.occursOn) {
    // If the event occurs on specific weekdays
    if (event.occursOn.weekDays) {
      while (!event.occursOn.weekDays.includes(nextOccurrence.isoWeekday())) {
        nextOccurrence.add(1, "day");
      }
    }

    // If the event occurs on a specific day of the month
    if (event.occursOn.dayOfTheMonth) {
      while (nextOccurrence.date() !== event.occursOn.dayOfTheMonth) {
        nextOccurrence.add(1, "day");
      }
    }
  }
  return nextOccurrence;
};

export const getNextEventOccurrence = (eventName: EventKey): moment.Moment => {
  const event = eventData[eventName];
  if (!event) throw new Error("Unknow Event");

  const now = moment().tz("America/Los_Angeles"); // Current time
  const nextOccurrence = getOccurenceDay(event);

  // Loop to calculate the next occurrence based on the interval
  while (nextOccurrence.isBefore(now)) {
    nextOccurrence.add(event.interval || 0, "minutes");
  }

  return nextOccurrence;
};

export const nextOccurrences = (() => {
  const keys = Object.keys(eventData);
  const occurences: Record<EventKey, moment.Moment> = {};
  for (const key of keys) {
    occurences[key] = getNextEventOccurrence(key);
  }
  return occurences;
})();

