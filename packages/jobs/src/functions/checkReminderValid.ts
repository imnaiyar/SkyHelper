import { DateTime } from "luxon";
import { type EventDetails } from "@skyhelperbot/utils";
import type { TSValue } from "@/utils/getTS";

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export function checkReminderValid(now: DateTime, details: EventDetails | TSValue, offset = 0): boolean {
  const previousMinute = now.minus({ seconds: 15 });
  const isTS = "nextVisit" in details;

  const nextOccurence = isTS ? details.nextVisit : (details as EventDetails).nextOccurence;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const currentOccurenceDate = isTS
    ? details.nextVisit
    : (details as EventDetails).nextOccurence.minus({ minutes: (details as EventDetails).event.interval ?? 0 }); // subtract the interval to get the previous time, because if it just occured, nextOccurence will point to the upcoming event, ignoring the currently active (only for those, that do not have duration to their event.), by this, we check if the previous occurence is between 30s drift of 'now' and assume it just became active. This is only needed for 0 offset based reminder as offsetted one will always point to next occurence as opposed to the ones that just became active (occured)

  // 0-offset should be true when it just became active
  if (offset === 0 && previousMinute < currentOccurenceDate! && now.plus({ minutes: 15 }) > currentOccurenceDate!) {
    return true;
  }

  // bounds to account for interval drifts
  const lowerBound = now.minus({ seconds: 15 });
  const upperBound = now.plus({ seconds: 15 });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const offsetted = nextOccurence.minus({ minutes: offset }).toMillis();

  // Offset-based reminder
  if (offsetted >= lowerBound.toMillis() && offsetted <= upperBound.toMillis()) {
    return true;
  }

  return false;
}
