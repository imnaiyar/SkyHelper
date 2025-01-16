import { Base, time } from "discord.js";
import moment from "moment-timezone";
import "moment-duration-format";
import { eventData } from "../constants/eventDatas";

type EventKey = keyof typeof eventData;
/**
 * Utilities for skytimes
 */
export class SkytimesUtils {
  /** Get all occurences of an event for the given date
   * @param eventTime The moment date for which to get all occurences
   * @param interval The interval between the event occurence's
   */
  public static getAllTimes(eventTime: moment.Moment, interval?: number): string {
    const clonedTime = eventTime.clone();
    const timeBuilt = [];
    while (eventTime.date() === clonedTime.date()) {
      timeBuilt.push(time(clonedTime.toDate(), "t"));
      clonedTime.add(interval || 0, "minutes");
    }
    return timeBuilt.join(" • ");
  }

  /**
   * Get the date in moment on which the event will occur (if it's not a daily event)
   * @param event The event for which to get the date-time
   */
  private static getOccurenceDay(event: (typeof eventData)[EventKey]) {
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
  }

  /**
   * Get the next occurence of the event relative to now
   * @param eventName The key of the event
   */
  private static getNextEventOccurrence(eventName: EventKey): moment.Moment {
    const event = eventData[eventName];
    if (!event) throw new Error("Unknow Event");

    const now = moment().tz("America/Los_Angeles"); // Current time
    const nextOccurrence = this.getOccurenceDay(event);

    // Loop to calculate the next occurrence based on the interval
    while (nextOccurrence.isBefore(now)) {
      nextOccurrence.add(event.interval || 0, "minutes");
    }

    return nextOccurrence;
  }

  /**
   * Get the details about an event, their status, next occurence, al occurences for the day
   * @param key The event key
   */
  public static getEventDetails(key: EventKey): EventDetails {
    const nextOccurence = this.getNextEventOccurrence(key);
    return {
      event: eventData[key],
      nextOccurence,
      allOccurences: this.getAllTimes(this.getOccurenceDay(eventData[key]), eventData[key].interval),
      status: this.getEventStatus(eventData[key], nextOccurence),
    };
  }

  /**
   * Same as {@apilink SkytimesUtils.getEventDetails | getEventDetails} but for all of the events
   * @returns An array of event details
   */
  public static allEventDetails(): [EventKey, EventDetails][] {
    const keys = Object.keys(eventData).sort((a, b) => eventData[a].index - eventData[b].index);
    const occurences: [EventKey, EventDetails][] = [];

    for (const key of keys) {
      occurences.push([key, this.getEventDetails(key)]);
    }
    return occurences;
  }

  /**
   * Returns the event status of a given event
   * @param event The event to get the status for
   * @param nextOccurence The next occurence of the event relative to "now"
   * @returns The event status (or null if there is no active duration)
   */
  public static getEventStatus(event: (typeof eventData)[keyof typeof eventData], nextOccurence: moment.Moment): Times {
    const now = moment().tz("America/Los_Angeles");
    const BASE: NotActiveTimes = {
      active: false,
      nextTime: nextOccurence,
      duration: moment.duration(nextOccurence.diff(now)).format("d[d] h[h] m[m] s[s]"),
    };
    if (!event.duration) return BASE;
    // Substract the interval because nextOccurence always calculates the next upcoming event
    // So we substract the interval to get the last occurence, and add the active duration to it, and check if now is between those
    const start = nextOccurence.clone().subtract(event.interval || 0, "minutes");
    const end = start.clone().add(event.duration, "minutes");

    // When active
    if (now.isBetween(start, end)) {
      return {
        active: true,
        startTime: start,
        endTime: end,

        // TODO: This maybe not needed as nextoccurence is inncluded in original object returned from `eventOccurence()`
        nextTime: nextOccurence,
        duration: moment.duration(end.diff(now)).format("d[d] h[h] m[m] s[s]"),
      };
    } else {
      return BASE;
    }
  }
}

export interface BaseTimes {
  /** Whether the event is active or not */
  active: boolean;

  /** The time when the event starts */
  nextTime: moment.Moment;

  /** This will be the countdown for when the event ends if it's active,
   *  otherwise it'll be the countdown to the next occurence
   */
  duration: string;
}

export interface ActiveTimes extends BaseTimes {
  active: true;
  /** The time when the event started if active */
  startTime: moment.Moment;

  /** The time when the event ends if active */
  endTime: moment.Moment;
}
export interface NotActiveTimes extends BaseTimes {
  active: false;
  /** The time when the event started if active */
  startTime?: moment.Moment;

  /** The time when the event ends if active */
  endTime?: moment.Moment;
}
export type Times = ActiveTimes | NotActiveTimes;

export interface EventDetails {
  event: (typeof eventData)[EventKey];
  nextOccurence: moment.Moment;
  allOccurences: string;
  status: Times;
}
