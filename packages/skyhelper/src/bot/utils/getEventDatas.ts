import { getEvent } from "@/schemas/SpecialEvents";
import type { EventType } from "@/types/custom";
import { DateTime } from "luxon";
import { getTS } from "@/schemas/TS";
import type { TSValue } from "@/types/schemas";

type T = EventType | string;
export const getSpecialEvent = async (): Promise<T> => {
  const data = await getEvent();
  const { startDate, endDate, name } = data;
  const now = DateTime.now().setZone("America/Los_Angeles");
  const start = DateTime.fromFormat(startDate, "dd-MM-yyyy", { zone: "America/Los_Angeles" }).startOf("day");
  const end = DateTime.fromFormat(endDate, "dd-MM-yyyy", { zone: "America/Los_Angeles" }).endOf("day");

  if (now >= start && now <= end) {
    return {
      active: true,
      name: name,
      start: start,
      end: end,
      duration: end.diff(now, ["days", "hours", "minutes", "seconds"]).toFormat("d'd' h'h' m'm' s's'"),
      days: Math.ceil(end.diff(start, "days").days),
    };
  } else if (now < start) {
    return {
      active: false,
      name: name,
      start: start,
      end: end,
      duration: start.diff(now, ["days", "hours", "minutes", "seconds"]).toFormat("d'd' h'h' m'm' s's'"),
      days: Math.ceil(end.diff(start, "days").days),
    };
  } else {
    return "No Events";
  }
};

/**
 * Returns TS status
 */
export const getTSData = async (): Promise<TSValue | undefined> => {
  const timezone = "America/Los_Angeles";
  const data = await getTS();
  const { name, visitDate, index, value } = data;
  const now = DateTime.now().setZone(timezone);
  const [day, month, year] = visitDate.split("-").map(Number);
  const lastVisitDate = DateTime.fromObject({ day, month, year }, { zone: timezone }).startOf("day");
  const lastDepartDate = lastVisitDate.plus({ days: 3 }).endOf("day");
  let nextDepartDate = lastDepartDate;

  while (now > nextDepartDate) {
    nextDepartDate = nextDepartDate.plus({ days: 14 });
  }

  const nextVisitDay = nextDepartDate.minus({ days: 3 }).startOf("day");

  if (now < nextVisitDay) {
    const duration = nextVisitDay.diffNow(["days", "hours", "minutes", "seconds"]).toFormat("d'd' h'h' m'm' s's'");
    if (nextVisitDay > lastVisitDate) {
      return {
        visiting: false,
        nextVisit: nextVisitDay,
        duration: duration,
      };
    }

    if (nextVisitDay.equals(lastVisitDate)) {
      return {
        visiting: false,
        name: name,
        index: index,
        nextVisit: nextVisitDay,
        value: value,
        duration: duration,
      };
    }
  }

  if (now >= nextVisitDay && now <= nextDepartDate) {
    const duration = nextDepartDate.diffNow(["days", "hours", "minutes", "seconds"]).toFormat("d'd' h'h' m'm' s's'");
    if (lastDepartDate < nextDepartDate) {
      return {
        visiting: true,
        nextVisit: nextVisitDay,
        duration: duration,
      };
    }

    if (lastDepartDate.equals(nextDepartDate)) {
      return {
        visiting: true,
        name: name,
        nextVisit: nextVisitDay,
        index: index,
        duration: duration,
        value: value,
      };
    }
  }
};
