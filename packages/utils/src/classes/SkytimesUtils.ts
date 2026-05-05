import { eventData, type EventKey } from "../constants/eventDatas.js";
import { DateTime } from "luxon";
import { zone } from "../constants/index.js";
/**
 * Utilities for skytimes
 */
export class SkytimesUtils {
  /** Get all occurrences of an event for the given date
   * @param eventTime The DateTime for which to get all occurrences
   * @param interval The interval between the event occurrences
   */
  public static getAllTimes(eventTime: DateTime, interval?: number): string {
    let clonedTime = eventTime;
    const timeBuilt = [];
    while (eventTime.hasSame(clonedTime, "day")) {
      timeBuilt.push(`<t:${clonedTime.toUnixInteger()}:t>`);
      clonedTime = clonedTime.plus({ minutes: interval ?? 0 });
    }
    return timeBuilt.join(" • ");
  }

  /**
   * Get the date in DateTime on which the event will occur (if it's not a daily event)
   * @param event The event for which to get the date-time
   */
  private static getOccurrenceDay(event: (typeof eventData)[EventKey]): DateTime {
    let nextOccurrence = DateTime.now().setZone(zone).startOf("day").plus({ minutes: event.offset }); // Start with the offset from the beginning of the day

    if (event.occursOn) {
      // If the event occurs on specific weekdays
      if (event.occursOn.weekDays) {
        while (!event.occursOn.weekDays.includes(nextOccurrence.weekday)) {
          nextOccurrence = nextOccurrence.plus({ days: 1 });
        }
      }

      // If the event occurs on a specific day of the month
      if (event.occursOn.dayOfTheMonth) {
        while (nextOccurrence.day !== event.occursOn.dayOfTheMonth) {
          nextOccurrence = nextOccurrence.plus({ days: 1 });
        }
      }
    }
    return nextOccurrence;
  }

  /**
   * Get the next occurrence of the event relative to now
   * @param eventName The key of the event
   */
  public static getNextEventOccurrence(eventName: EventKey): DateTime {
    const event = eventData[eventName];
    if (!event as boolean /* lol */) throw new Error("Unknown Event");

    const now = DateTime.now().setZone(zone); // Current time
    let nextOccurrence = this.getOccurrenceDay(event);

    // Loop to calculate the next occurrence based on the interval
    while (nextOccurrence < now) {
      nextOccurrence = nextOccurrence.plus({ minutes: event.interval ?? 0 });
    }

    return nextOccurrence;
  }

  /**
   * Get the details about an event, their status, next occurrence, all occurrences for the day
   * @param key The event key
   */
  public static getEventDetails(key: EventKey): EventDetails {
    const nextOccurence = this.getNextEventOccurrence(key);
    return {
      key,
      event: eventData[key],
      nextOccurence: nextOccurence.toMillis(),
      status: this.getEventStatus(eventData[key], nextOccurence),
    };
  }

  /**
   * Same as {@apilink SkytimesUtils.getEventDetails | getEventDetails} but for all of the events
   * @returns An array of event details
   */
  public static allEventDetails(): Array<EventDetails> {
    const keys = (Object.keys(eventData) as EventKey[]).sort((a, b) => eventData[a].index - eventData[b].index);
    const occurrences: Array<EventDetails> = [];

    for (const key of keys) {
      occurrences.push(this.getEventDetails(key));
    }
    return occurrences;
  }

  /**
   * Returns the event status of a given event
   * @param event The event to get the status for
   * @param nextOccurrence The next occurrence of the event relative to "now"
   * @returns The event status (or null if there is no active duration)
   */
  public static getEventStatus(event: (typeof eventData)[keyof typeof eventData], nextOccurrence: DateTime): Times {
    const now = DateTime.now().setZone(zone);
    const BASE: NotActiveTimes = {
      active: false,
      nextTime: nextOccurrence.toMillis(),
    };
    if (!event.duration) return BASE;

    // Subtract the interval because nextOccurrence always calculates the next upcoming event
    // So we subtract the interval to get the last occurrence, and add the active duration to it, and check if now is between those
    const start = nextOccurrence.minus({ minutes: event.interval ?? 0 });
    const end = start.plus({ minutes: event.duration });

    // When active
    if (now >= start && now <= end) {
      return {
        active: true,
        startTime: start.toMillis(),
        endTime: end.toMillis(),
        nextTime: nextOccurrence.toMillis(),
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
  nextTime: number;
}

export interface ActiveTimes extends BaseTimes {
  active: true;
  /** The time when the event started if active */
  startTime: number;

  /** The time when the event ends if active */
  endTime: number;
}
export interface NotActiveTimes extends BaseTimes {
  active: false;
  /** The time when the event started if active */
  startTime?: number;

  /** The time when the event ends if active */
  endTime?: number;
}
export type Times = ActiveTimes | NotActiveTimes;

export interface EventDetails {
  /** Event key */
  key: EventKey;
  event: (typeof eventData)[EventKey];
  nextOccurence: number;
  status: Times;
}
