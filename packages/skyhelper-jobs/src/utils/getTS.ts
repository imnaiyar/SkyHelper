import { getTSDB } from "#src/database/getTSDB.js";
import moment from "moment-timezone";
interface TSValue {
  visiting: boolean;
  name?: string;
  nextVisit: moment.Moment;
  index?: number;
  spiritImage?: string;
  duration: string;
  value?: string;
}
export default async (): Promise<TSValue | undefined> => {
  const timezone = "America/Los_Angeles";
  const data = await getTSDB();
  const { name, spiritImage, visitDate, index, value } = data;
  const now = moment().tz(timezone);
  const lastVisitDate = moment.tz(visitDate, "DD-MM-YYYY", timezone).startOf("day");
  const lastDepartDate = lastVisitDate.clone().add("3", "day").endOf("day");
  const nextDepartDate = lastDepartDate.clone();
  while (now.isAfter(nextDepartDate)) {
    nextDepartDate.add(14, "days");
  }
  const nextVisitDay = nextDepartDate.clone().subtract(3, "day").startOf("day");
  if (now.isBefore(nextVisitDay)) {
    const dur = moment.duration(nextVisitDay.diff(now)).format("d[d] h[h] m[m] s[s]");
    if (nextVisitDay.isAfter(lastVisitDate)) {
      return {
        visiting: false,
        nextVisit: nextVisitDay,
        duration: dur,
      };
    }

    if (nextVisitDay.isSame(lastVisitDate)) {
      return {
        visiting: false,
        name: name,
        spiritImage: spiritImage,
        index: index,
        nextVisit: nextVisitDay,
        value: value,
        duration: dur,
      };
    }
  }

  if (now.isBetween(nextVisitDay, nextDepartDate)) {
    const dur = moment.duration(nextDepartDate.diff(now)).format("d[d] h[h] m[m] s[s]");
    if (lastDepartDate.isBefore(nextDepartDate)) {
      return {
        visiting: true,
        nextVisit: nextVisitDay,
        duration: dur,
      };
    }

    if (lastDepartDate.isSame(nextDepartDate)) {
      return {
        visiting: true,
        name: name,
        nextVisit: nextVisitDay,
        index: index,
        spiritImage: spiritImage,
        duration: dur,
        value: value,
      };
    }
  }
};
