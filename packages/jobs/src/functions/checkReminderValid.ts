import { DateTime } from "luxon";
import { type EventDetails } from "@skyhelperbot/utils";
import type { TSValue } from "@/utils/getTS";

export function checkReminderValid(now: DateTime, details: EventDetails | TSValue, offset = 0): boolean {
  const previousMinute = now.minus({ seconds: 15 });
  const isTS = "nextVisit" in details;

  if (isTS) {
    // details is TSValue
    const nextOccurence = details.nextVisit;
    const currentOccurenceDate = details.nextVisit;

    // 0-offset should be true when it just became active
    if (offset === 0 && previousMinute < currentOccurenceDate && now.plus({ minutes: 15 }) > currentOccurenceDate) {
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
  } else {
    // details is EventDetails
    const nextOccurence = details.nextOccurence;
    const currentOccurenceDate = details.nextOccurence.minus({ minutes: details.event.interval ?? 0 });

    // 0-offset should be true when it just became active
    if (offset === 0 && previousMinute < currentOccurenceDate && now.plus({ minutes: 15 }) > currentOccurenceDate) {
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
  }

  return false;
}
