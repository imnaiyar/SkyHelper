import moment from "moment-timezone";
import "moment-duration-format";
import { ShardsCountdown } from "../typings";
import { shardsTimeline, shardConfig } from "../constants";

/**
 * Sequence of Shards pattern
 */
const shardSequence = ["C", "b", "A", "a", "B", "b", "C", "a", "A", "b", "B", "a"] as const;

/**
 * Sequence of realms pattern of shard
 */
const realmSequence = ["prairie", "forest", "valley", "wasteland", "vault"] as const;
/**
 * @class shardsUtil
 * @classdesc A class to handle shards and realms indexing.
 */
export class ShardsUtil {
  /**
   * @method getDate - get provided date in moment
   * @param  date - date to get in moment
   */
  static getDate(date?: string | undefined | null): moment.Moment | string {
    const timezone = "America/Los_Angeles";
    let currentDate: moment.Moment;
    try {
      if (date) {
        currentDate = moment.tz(date, "Y-MM-DD", timezone).startOf("day");
      } else {
        currentDate = moment().tz(timezone);
      }
      if (!currentDate.isValid()) {
        return "invalid";
      } else {
        return currentDate;
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Returns shards index for a given date
   * @param date
   */
  static shardsIndex(date: moment.Moment): {
    currentShard: (typeof shardSequence)[number];
    currentRealm: (typeof realmSequence)[number];
  } {
    const dayOfMonth = date.date();
    const shardIndex = (dayOfMonth - 1) % shardSequence.length;
    const currentShard = shardSequence[shardIndex];
    const realmIndex = (dayOfMonth - 1) % realmSequence.length;
    const currentRealm = realmSequence[realmIndex];

    return { currentShard, currentRealm };
  }

  /**
   * Returns suffix for a given number
   * @param number The number to get the suffix for
   */
  static getSuffix(number: number): string {
    const suffixes = ["th", "st", "nd", "rd"];
    const remainder10 = number % 10;
    const remainder100 = number % 100;

    // Suffix for shards index
    return suffixes[
      remainder10 === 1 && remainder100 !== 11
        ? 1
        : remainder10 === 2 && remainder100 !== 12
        ? 2
        : remainder10 === 3 && remainder100 !== 13
        ? 3
        : 0
    ];
  }

  /**
   * Get all three shards status for a given date relative to the current time
   * @param date The date for which to get the status for
   */
  static getStatus(date: moment.Moment): ShardsCountdown[] | "No Shard" {
    const timezone = "America/Los_Angeles";
    const { currentShard } = this.shardsIndex(date);
    const timings = shardsTimeline(date)[currentShard];
    const present = moment().tz(timezone);
    const isNoShard = shardConfig[currentShard].weekdays.includes(date.day());
    if (isNoShard) return "No Shard";
    const toReturn: ShardsCountdown[] = [];
    for (let i = 0; i < timings.length; i++) {
      const eventTiming = timings[i];
      // Active
      if (present.isBetween(eventTiming.start, eventTiming.end)) {
        toReturn.push({
          index: i + 1,
          active: true,
          start: eventTiming.start,
          end: eventTiming.end,
          duration: moment.duration(eventTiming.end.diff(present)).format("d[d] h[h] m[m] s[s]"),
        });
        continue;
        // Yet to fall
      } else if (present.isBefore(eventTiming.start)) {
        toReturn.push({
          index: i + 1,
          active: false,
          start: eventTiming.start,
          end: eventTiming.end,
          duration: moment.duration(eventTiming.start.diff(present)).format("d[d] h[h] m[m] s[s]"),
        });
        continue;
        // All ended
      } else if (present.isAfter(eventTiming.end)) {
        toReturn.push({
          index: i + 1,
          ended: true,
          start: eventTiming.start,
          end: eventTiming.end,
          duration: moment.duration(present.diff(eventTiming.end)).format("d[d] h[h] m[m] s[s]"),
        });
        continue;
      }
    }
    return toReturn;
  }
}
