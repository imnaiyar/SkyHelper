import { DailyQuest } from "#libs";
import moment from "moment-timezone";

/**
 * Check if the given quest data is valid for the current day
 * @param data Quest data
 */
export const checkQuestValidity = (data: DailyQuest): boolean => {
  const now = moment().tz("America/Los_Angeles").startOf("day");
  const questDate = moment.tz(data.date, "America/Los_Angeles").startOf("day");
  return now.isSame(questDate);
};
