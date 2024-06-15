import moment from "moment-timezone";
import { Document } from "mongoose";
import type { ScheduleOptions } from "node-cron";

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

export interface BaseTimes {
  /* Whether the event is active or not */
  active: boolean;

  /* The time when the event starts */
  nextTime: moment.Moment;

  /* The countdown to the event */
  duration: string;
}

interface ActiveTimes extends BaseTimes {
  active: true;
  /* The time when the event started if active */
  startTime: moment.Moment;

  /* The time when the event ends if active */
  endTime: moment.Moment;
}
interface NotActiveTimes extends BaseTimes {
  active: false;
  /* The time when the event started if active */
  startTime?: moment.Moment;

  /* The time when the event ends if active */
  endTime?: moment.Moment;
}
export type Times = ActiveTimes | NotActiveTimes;

export interface TSData extends Document {
  // Name of the returning TS
  name: string;

  /* The value of spirit in the spiritsData */
  value: string;

  /* Date of the visit */
  visitDate: string;

  /* Link to the image of the spirit */
  spiritImage: string;

  /* TS returning Index */
  index: number;
}

export interface EventData extends Document {
  /* Start date of the event */
  startDate: string;

  /* End date of the event */
  endDate: string;

  /* Name of the event */
  name: string;
}

export interface EventType {
  active: boolean;
  name: string;
  start: moment.Moment;
  end: moment.Moment;
  duration: string;
  days: number;
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
export interface SpiritItems {
  item: string;
  icon: string;
  price: number;
  canSkip?: boolean;
  pass?: boolean;
}
export interface SeasonPrice {
  icon?: string;
  cosmetics: SpiritItems[];
}
export interface LiveUpdates {
  active: boolean;
  messageId: string;
  webhook: {
    id: string | null;
    token: string | null;
  };
}
export interface EventReminder {
  active: boolean;
  last_messageId?: string;
  role: string | null;
}
export interface Reminders {
  active: boolean;
  default_role: string | null;
  dailies: EventReminder;
  grandma: EventReminder;
  turtle: EventReminder;
  geyser: EventReminder;
  reset: EventReminder;
  eden: EventReminder;
  webhook: {
    id: string | null;
    token: string | null;
    channelId: string | null;
  };
}
export interface GuildSchema extends Document {
  _id: string;
  data: {
    name: string;
    region: string;
    owner: string;
    joinedAt: Date;
    leftAt: Date;
    bots: number;
  };
  annoucement_channel: string | null;
  beta: boolean;
  prefix: string;
  language?: {
    name: string;
    value: string;
    flag?: string;
  };
  reminders: Reminders;
  autoShard: LiveUpdates;
  autoTimes: LiveUpdates;
}

export interface JobOptions {
  interval: string;
  callback: () => Promise<void>;
  options?: ScheduleOptions;
}
