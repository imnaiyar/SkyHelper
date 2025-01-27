import { DateTime } from "luxon";

/**
 * Check if the given quest data is valid for the current day
 * @param data Quest data
 */
export const checkQuestValidity = (date: string): boolean => {
  const now = DateTime.now().setZone("America/Los_Angeles").startOf("day");
  const questDate = DateTime.fromISO(date, { zone: "America/Los_Angeles" }).startOf("day");
  return now.hasSame(questDate, "millisecond");
};
