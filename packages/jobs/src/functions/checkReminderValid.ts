import { DateTime } from "luxon";
import { type EventDetails } from "@skyhelperbot/utils";
import type { TSValue } from "@/utils/getTS";

export function checkReminderValid(now: DateTime, details: EventDetails | TSValue, offset: number = 0): boolean {
  const previousMinute = now.minus({ seconds: 30 });
  const isTS = "nextVisit" in details;
  const isActive = isTS ? details.visiting : details.status.active;

  const nextOccurence = isTS ? details.nextVisit : details.nextOccurence;

  const currentOccurenceDate = isTS ? details.nextVisit : details.status.startTime;
  // bounds to account for interval drifts
  const lowerBound = now.minus({ seconds: 15 });
  const upperBound = now.plus({ seconds: 15 });
  const offsetted = nextOccurence.minus({ minutes: offset }).toMillis();
  // Offset-based reminder
  if (offsetted >= lowerBound.toMillis() && offsetted <= upperBound.toMillis()) {
    return true;
  }

  // 0-offset should be true when it just became active
  if (offset === 0 && isActive && previousMinute < currentOccurenceDate! && now >= currentOccurenceDate!) {
    return true;
  }
  return false;
}
