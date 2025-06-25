import { DateTime } from "luxon";
import type { ShardsCountdown } from "../typings.js";
import { shardsTimeline, shardConfig, shardsInfo } from "../constants/index.js";
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
   * @method getDate - get provided date in luxon
   * @param  date - date to get in moment
   */
  static getDate(date?: string | undefined | null): DateTime | string {
    const timezone = "America/Los_Angeles";
    let currentDate: DateTime;
    try {
      if (date) {
        const [year, month, day] = date.split("-").map(Number);
        currentDate = DateTime.fromObject({ year, month, day }, { zone: timezone }).startOf("day");
      } else {
        currentDate = DateTime.now().setZone(timezone).startOf("day");
      }
      if (!currentDate.isValid) {
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
  static shardsIndex(date: DateTime): {
    currentShard: (typeof shardSequence)[number];
    currentRealm: (typeof realmSequence)[number];
  } {
    const dayOfMonth = date.day;
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
  static getStatus(date: DateTime): ShardsCountdown[] | "No Shard" {
    const timezone = "America/Los_Angeles";
    const { currentShard } = this.shardsIndex(date);
    const timings = shardsTimeline(date)[currentShard];
    const present = DateTime.now().setZone(timezone);
    const isNoShard = shardConfig[currentShard].weekdays.includes(date.weekday);
    if (isNoShard) return "No Shard";
    const toReturn: ShardsCountdown[] = [];
    for (let i = 0; i < timings.length; i++) {
      const eventTiming = timings[i];
      // Active
      if (present >= eventTiming.start && present <= eventTiming.end) {
        toReturn.push({
          index: i + 1,
          active: true,
          start: eventTiming.start,
          end: eventTiming.end,
          duration: eventTiming.end.diff(present, ["days", "hours", "minutes", "seconds"]).toFormat("dd'd' hh'h' mm'm' ss's'"),
        });
        continue;
        // Yet to fall
      } else if (present < eventTiming.start) {
        toReturn.push({
          index: i + 1,
          active: false,
          start: eventTiming.start,
          end: eventTiming.end,
          duration: eventTiming.start.diff(present, ["days", "hours", "minutes", "seconds"]).toFormat("dd'd' hh'h' mm'm' ss's'"),
        });
        continue;
        // All ended
      } else if (present > eventTiming.end) {
        toReturn.push({
          index: i + 1,
          ended: true,
          start: eventTiming.start,
          end: eventTiming.end,
          duration: present.diff(eventTiming.end, ["days", "hours", "minutes", "seconds"]).toFormat("dd'd' hh'h' mm'm' ss's'"),
        });
        continue;
      }
    }
    return toReturn;
  }

  /**
   * Get the next occuring black/red shard from now for today's date;
   * @param shardType The type of shard to get the next occuring shard for
   */
  static getNextShard(shardType?: ("black" | "red")[]) {
    const timezone = "America/Los_Angeles";
    const present = DateTime.now().setZone(timezone);
    const currentDate = this.getDate();
    if (typeof currentDate === "string") return null;
    const { currentRealm, currentShard } = this.shardsIndex(currentDate);
    const info = shardsInfo[currentRealm][currentShard];
    const isNoShard = shardConfig[currentShard].weekdays.includes(present.weekday);
    if (isNoShard) return null;
    if (shardType && !shardType.some((s) => info.type.toLowerCase().includes(s))) return null;
    const timings = shardsTimeline(currentDate)[currentShard];
    for (const [i, eventTiming] of timings.entries()) {
      if (present <= eventTiming.start) {
        return {
          index: i + 1,
          start: eventTiming.start,
          end: eventTiming.end,
          duration: eventTiming.start.diff(present, ["days", "hours", "minutes", "seconds"]).toFormat("dd'd' hh'h' mm'm' ss's'"),
          info,
        };
      }
    }
    return null;
  }
}
