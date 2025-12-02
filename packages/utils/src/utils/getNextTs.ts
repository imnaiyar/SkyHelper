import { DateTime } from "luxon";
import { zone } from "@skyhelperbot/constants";

/**
 * Returns TS status
 */
export function getNextTs() {
  const refrenceDate = DateTime.fromISO("2024-11-04").startOf("day"); // reference date to calculate the next ts from
  const now = DateTime.now().setZone(zone);
  const refrenceDeparture = refrenceDate.plus({ days: 3 }).endOf("day");
  let nextDepartDate = refrenceDeparture;

  while (now > nextDepartDate) {
    nextDepartDate = nextDepartDate.plus({ days: 14 });
  }

  const nextVisitDay = nextDepartDate.minus({ days: 3 }).startOf("day");

  if (now < nextVisitDay) {
    const duration = nextVisitDay.diffNow(["days", "hours", "minutes", "seconds"]).toFormat("d'd' h'h' m'm' s's'");
    if (nextVisitDay > refrenceDate) {
      return {
        visiting: false,
        nextVisit: nextVisitDay,
        duration: duration,
      };
    }

    if (nextVisitDay.equals(refrenceDate)) {
      return {
        visiting: false,
        nextVisit: nextVisitDay,
        duration: duration,
      };
    }
  }

  if (now >= nextVisitDay && now <= nextDepartDate) {
    const duration = nextDepartDate.diffNow(["days", "hours", "minutes", "seconds"]).toFormat("d'd' h'h' m'm' s's'");
    if (refrenceDeparture < nextDepartDate) {
      return {
        visiting: true,
        nextVisit: nextVisitDay,
        duration: duration,
      };
    }

    if (refrenceDate.equals(nextDepartDate)) {
      return {
        visiting: true,
        nextVisit: nextVisitDay,
        duration: duration,
      };
    }
  }
}
