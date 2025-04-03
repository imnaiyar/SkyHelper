import { DateTime } from "luxon";
import { type EventDetails } from "@skyhelperbot/utils";

export function checkReminderValid(now: DateTime, details: EventDetails, offset: number = 0): boolean {
  const previousMinute = now.minus({ seconds: 30 });

  const { nextOccurence, status } = details;

  // bounds to account for interval drifts
  const lowerBound = now.minus({ seconds: 15 });
  const upperBound = now.plus({ seconds: 15 });
  const offsetted = nextOccurence.minus({ minutes: offset }).toMillis();
  // Offset-based reminder
  if (offsetted >= lowerBound.toMillis() && offsetted <= upperBound.toMillis()) {
    return true;
  }

  // 0-offset should be true when it just became active
  if (offset === 0 && status.active && previousMinute < status.startTime! && now >= status.startTime!) {
    return true;
  }
  return false;
}
