import { DateTime } from "luxon";
import { zone } from "../constants/index.js";

/**
 * Returns TS status
 */
export function getNextTs() {
  const refrenceDate = DateTime.fromISO("2025-11-20", { zone }).startOf("day"); // reference date to calculate the next ts from
  const now = DateTime.now().setZone(zone);
  const refrenceDeparture = refrenceDate.plus({ days: 3 }).endOf("day");
  let nextDepartDate = refrenceDeparture;

  while (now > nextDepartDate) {
    nextDepartDate = nextDepartDate.plus({ days: 14 });
  }

  const nextVisitDay = nextDepartDate.minus({ days: 3 }).startOf("day");

  if (now < nextVisitDay) {
    if (nextVisitDay > refrenceDate) {
      return {
        visiting: false,
        nextVisit: nextVisitDay,
      };
    }

    if (nextVisitDay.equals(refrenceDate)) {
      return {
        visiting: false,
        nextVisit: nextVisitDay,
      };
    }
  }

  if (now >= nextVisitDay && now <= nextDepartDate) {
    if (refrenceDeparture < nextDepartDate) {
      return {
        visiting: true,
        nextVisit: nextVisitDay,
      };
    }

    if (refrenceDate.equals(nextDepartDate)) {
      return {
        visiting: true,
        nextVisit: nextVisitDay,
      };
    }
  }
}
