import { getTSDB } from "@/database/getTSDB";
import { DateTime } from "luxon";
interface TSValue {
  visiting: boolean;
  name?: string;
  nextVisit: DateTime;
  index?: number;
  spiritImage?: string;
  duration: string;
  value?: string;
}
export default async (): Promise<TSValue | undefined> => {
  const timezone = "America/Los_Angeles";
  const data = await getTSDB();
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
