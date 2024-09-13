import moment from "moment-timezone";
import { Document } from "mongoose";
import type { ScheduleOptions } from "node-cron";

export interface TSData extends Document {
  /** Name of the returning TS */
  name: string;

  /** The value of spirit in the spiritsData */
  value: string;

  /** Date of the visit */
  visitDate: string;

  /** TS returning Index */
  index: number;
}

export interface EventData extends Document {
  /** Start date of the event */
  startDate: string;

  /** End date of the event */
  endDate: string;

  /** Name of the event */
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
export interface SpiritItems {
  item: string;
  icon: string;
  price: number;
  canSkip?: boolean;
  pass?: boolean;
}
export interface SeasonPrice {
  icon?: string;
  collectibles: SpiritItems[];
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

/** Reperesents a daily quest data */
export interface DailyQuest {
  /* Title for the quest */
  title: string;

  /*  The date this quest was saved on */
  date: string;

  /* Description for the quest (if any)*/
  description?: string;

  /* Image guide for the quest (if any) */
  images: {
    url: string;

    /* Credit for the guide */
    by: string;
    /* Source of the guide */
    source?: string;
  }[];
}
