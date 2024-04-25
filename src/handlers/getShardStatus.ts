import moment from "moment-timezone";
import "moment-duration-format";
import { ShardsUtil as util } from "skyhelper-utils";
import { shardsTimelines as shardsTime } from "#libs/constants/index";
import { ShardsCountdown } from "#src/libs/types";
import { shardConfig } from "#src/libs/constants/shardsInfo";
/**
 * Returns the shard info/times relative to present
 * @param date The date to get the shard information
 */
export default (date: moment.Moment): ShardsCountdown | "No Shard" => {
  const timezone = "America/Los_Angeles";
  const { currentShard } = util.shardsIndex(date);
  const timings = shardsTime(date)[currentShard];
  const present = moment().tz(timezone);
  const isNoShard = shardConfig[currentShard].weekdays.includes(date.day());
  if (isNoShard) return "No Shard";
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
