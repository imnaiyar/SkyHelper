import { eventData } from "#bot/libs/index";
import { type Times } from "#bot/libs/types";
import moment from "moment-timezone";
import "moment-duration-format";

/**
 * Returns the event status of a given event
 * @param event The event to get the status for
 * @param nextOccurence The next occurence of the event relative to "now"
 * @returns The event status (or null if there is no active duration)
 */
export function getEventStatus(event: (typeof eventData)[keyof typeof eventData], nextOccurence: moment.Moment): Times {
  const now = moment().tz("America/Los_Angeles");
  if (!event.duration) {
    return {
      active: false,
      nextTime: nextOccurence,
      duration: moment.duration(nextOccurence.diff(now)).format("d[d] h[h] m[m] s[s]"),
    };
  }

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
    return {
      active: false,
      nextTime: nextOccurence,
      duration: moment.duration(nextOccurence.diff(now)).format("d[d] h[h] m[m] s[s]"),
    };
  }
}
