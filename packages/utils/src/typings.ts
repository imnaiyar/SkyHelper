import type { DateTime } from "luxon";
import { Document } from "mongoose";

export interface SkyEvent {
  eventActive: boolean;
  eventName: string;
  eventStarts: DateTime;
  eventEnds: DateTime;
  eventDuration: string;
}
export interface TSData extends Document {
  name: string;
  visitDate: string;
  value: string;
  index: number;
}
export interface SpecialEventData extends Document {
  startDate: string;
  endDate: string;
  name: string;
}

export interface ShardsCountdown {
  // The shard index
  index: number;

  // Whether if the shard is ready
  active?: boolean;

  // Whether if all shards are ended for the given date
  ended?: boolean;

  // The landing time for the given shard
  start: DateTime;

  // THe end time for the given shard
  end: DateTime;

  // THe countdown for the shard end/land
  duration: string;
}
