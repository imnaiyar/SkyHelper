import { time } from "discord.js";
import moment from "moment-timezone";

export default (): {
  geyser: string;
  grandma: string;
  turtle: string;
} => {
  const buildTimestamps = (offset: number) => {
    const now = moment().tz("America/Los_Angeles").startOf("day").add(offset, "minutes");
    const clonedTime = now.clone();
    let timeBuilt = `> `;
    while (now.date() === clonedTime.date()) {
      timeBuilt += `${time(clonedTime.toDate(), "t")} 》`;
      clonedTime.add(2, "hours");
    }
    return timeBuilt;
  };
  return {
    geyser: buildTimestamps(0),
    grandma: buildTimestamps(30),
    turtle: buildTimestamps(50),
  };
};
