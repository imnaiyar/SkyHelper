import { DateTime } from "luxon";
import type { ShardsCountdown } from "../typings.js";
import { getDatesBetween } from "./utils.js";
import { zone } from "@skyhelperbot/constants";
import { getShardData, type ShardData } from "../constants/shard_data.js";
/**
 * @class shardsUtil
 * @classdesc A class to handle shards and realms indexing.
 */
export class ShardsUtil {
  /**
   * @method getDate - get provided date in luxon
   * @param  date - date to get in moment
   */
  static getDate(date?: string | null): DateTime | string {
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
      throw new Error(error as any);
    }
  }

  static getShard = getShardData;

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
    ]!;
  }

  /**
   * Get all three shards status for a given date relative to the current time
   * @param date The date for which to get the status for
   * @returns ShardCountdown object or null if no shard
   */
  static getStatus(date: DateTime): ShardsCountdown[] | null {
    const shard = this.getShard(date);
    if (!shard) return null;

    const present = DateTime.now().setZone(zone);

    const toReturn: ShardsCountdown[] = [];
    for (let i = 0; i < shard.occurrences.length; i++) {
      const occurrence = shard.occurrences[i]!;
      // Active
      if (present >= occurrence.shardLand && present <= occurrence.shardEnd) {
        toReturn.push({
          index: i + 1,
          active: true,
          start: occurrence.shardLand,
          end: occurrence.shardEnd,
          duration: occurrence.shardEnd
            .diff(present, ["days", "hours", "minutes", "seconds"])
            .toFormat("dd'd' hh'h' mm'm' ss's'"),
        });
        continue;
        // Yet to fall
      } else if (present < occurrence.shardLand) {
        toReturn.push({
          index: i + 1,
          active: false,
          start: occurrence.shardLand,
          end: occurrence.shardEnd,
          duration: occurrence.shardLand
            .diff(present, ["days", "hours", "minutes", "seconds"])
            .toFormat("dd'd' hh'h' mm'm' ss's'"),
        });
        continue;
        // All ended
      } else if (present > occurrence.shardEnd) {
        toReturn.push({
          index: i + 1,
          ended: true,
          start: occurrence.shardLand,
          end: occurrence.shardEnd,
          duration: present
            .diff(occurrence.shardEnd, ["days", "hours", "minutes", "seconds"])
            .toFormat("dd'd' hh'h' mm'm' ss's'"),
        });
        continue;
      }
    }
    return toReturn;
  }

  /**
   * Get the next occuring black/red shard timing for the given date;
   * @param shardType The type of shard to get the next occuring shard for
   * @returns the shard details or null if no shard is found
   */
  static getNextShard(
    date: DateTime,
    shardType?: Array<"black" | "red">,
  ): null | { index: number; start: DateTime; end: DateTime; duration: string; info: ShardData } {
    const shard = this.getShard(date);
    if (!shard) return null;

    if (shardType && !shardType.some((s) => shard.type.toLowerCase().includes(s))) return null;

    for (const [i, eventTiming] of shard.occurrences.entries()) {
      if (date <= eventTiming.shardLand) {
        return {
          index: i + 1,
          start: eventTiming.shardLand,
          end: eventTiming.shardEnd,
          duration: eventTiming.shardEnd.diff(date, ["days", "hours", "minutes", "seconds"]).toFormat("dd'd' hh'h' mm'm' ss's'"),
          info: shard,
        };
      }
    }
    return null;
  }

  /**
   * Get the next occuring shard timing from today
   * @param shardType The type of shard to get the next occuring shard for
   * @returns an upcoming shard relative from now
   */
  static getNextShardFromNow(shardType?: Array<"black" | "red">) {
    let present = DateTime.now().setZone("America/Los_Angeles");
    let nextShard = this.getNextShard(present, shardType);
    while (!nextShard) {
      present = present.plus({ days: 1 }).startOf("day"); // reset to start of the cuz....
      nextShard = this.getNextShard(present, shardType);
    }
    return nextShard;
  }

  /**
   * Get shards between given range
   */
  static getShardsBetween(start = DateTime.now().setZone(zone), end: DateTime) {
    const dates = getDatesBetween(start, end);
    const shards: Array<{ date: DateTime; shard: ReturnType<typeof ShardsUtil.getNextShard> }> = [];

    for (const date of dates) {
      shards.push({ date, shard: this.getNextShard(date) });
    }
    return shards;
  }
}
