import moment from "moment-timezone";
import "moment-duration-format";
import { ShardsUtil } from "skyhelper-utils";
const util = ShardsUtil;
import shardsTime from "#libs/datas/shardsTimelines";
import { ShardsCountdown } from "#src/libs/types";
/**
 * Returns the shard info/times relative to present
 * @param date The date to get the shard information
 */
export default (date: moment.Moment) => {
  const timezone = "America/Los_Angeles";
  const { currentShard } = util.shardsIndex(date);
  const timings = shardsTime(date)[currentShard as "a" | "A" | "b" | "B" | "C"];
  const present = moment().tz(timezone);

  let toReturn: ShardsCountdown = {
    ended: true,
    start: present,
    end: present,
    duration: moment.duration(present.diff(date)).format("d[d] h[h] m[m] s[s]"),
  };
  for (let i = 0; i < timings.length; i++) {
    const eventTiming = timings[i];
    if (present.isBetween(eventTiming.start, eventTiming.end)) {
      toReturn = {
        index: i + 1,
        active: true,
        start: eventTiming.start,
        end: eventTiming.end,
        duration: moment.duration(eventTiming.end.diff(present)).format("d[d] h[h] m[m] s[s]"),
      };
      break;
    } else if (present.isBefore(eventTiming.start)) {
      toReturn = {
        index: i + 1,
        active: false,
        start: eventTiming.start,
        end: eventTiming.end,
        duration: moment.duration(eventTiming.start.diff(present)).format("d[d] h[h] m[m] s[s]"),
      };
      break;
    } else if (i === timings.length - 1 && present.isAfter(eventTiming.end)) {
      toReturn = {
        ended: true,
        start: eventTiming.start,
        end: eventTiming.end,
        duration: moment.duration(present.diff(eventTiming.end)).format("d[d] h[h] m[m] s[s]"),
      };
      break;
    }
  }
  return toReturn;
};
