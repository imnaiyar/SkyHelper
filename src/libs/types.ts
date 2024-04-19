import moment from "moment-timezone";
import { Document } from "mongoose";

export type ContextMenuType = "UserContext" | "MessageContext" | null;

/* eslint-disable */
export enum ContextTypes {
  /** Command can be used in guilds */
  Guild = 0,

  /** Command can be used in Bot's DM */
  BotDM = 1,

  /** Command can be used in other's DMs (Group DMs, DMs) */
  PrivateChannels = 2,
}

export enum IntegrationTypes {
  /** Command is for guild */
  Guilds = 0,

  /** Command is for User apps */
  Users = 1,
}

export interface ShardsCountdown {
  // The shard index
  index?: number;

  // Whether if the shard is ready
  active?: boolean;

  // Whether if all shards are ended for the given date
  ended?: boolean;

  // The landing time for the given shard
  start: moment.Moment;

  // THe end time for the given shard
  end: moment.Moment;

  // THe countdown for the shard end/land
  duration: string;
}

export interface Times {
  /* Whether the event is active or not */
  active: boolean;

  /* The time when the event started if active */
  startTime?: moment.Moment;

  /* The time when the event ends if active */
  endTime?: moment.Moment;

  /* The time when the event starts */
  nextTime: moment.Moment;

  /* The countdown to the event */
  duration: string;
}

export interface TSData extends Document {
  name: string;
  value: string;
  visitDate: string;
  spiritImage: string;
  index: number;
}

interface Level {
  title: string;
  description?: string;
  image: string;
}
export interface SpiritsData {
  name: string;
  type: string;
  realm?: string;
  season?: string;
  current?: boolean;
  main?: {
    description: string;
    total?: string;
    image: string;
  };
  ts?: {
    eligible: boolean;
    returned: boolean;
    total?: string;
    dates: string[];
  };
  tree?: {
    by: string;
    total: string;
    image: string;
  };
  location?: {
    by: string;
    description?: string;
    image: string;
  };
  emote?: {
    icon: string;
    level: Level[];
  };
  call?: {
    title: string;
    icon: string;
    image: string;
  };
  stance?: {
    title: string;
    icon: string;
    image: string;
  };
  action?: {
    icon: string;
    level: Level[];
  };
  cosmetics?: any;
}
