import type { DateTime } from "luxon";
import type { Document } from "mongoose";
import type { DailyQuest } from "./custom.js";

// #region User
export interface UserSchema extends Document {
  _id: string;
  data: {
    id: string;
    username: string;
    createdAt: Date;
  };
  language?: {
    name: string;
    value: string;
    flag?: string;
  };
  isBlacklisted: boolean;
  hangman?: {
    singleMode: { gamesPlayed: number; gamesWon: number };
    doubleMode: { gamesPlayed: number; gamesWon: number };
  };
  linkedRole?: {
    username?: string;
    metadata?: {
      wings?: number;
      since?: string;
      hangout?: boolean;
      cr?: boolean;
      eden?: boolean;
    };
  };
}

// #region Guild
export interface LiveUpdates {
  active: boolean;
  messageId: string;
  webhook: {
    id: string | null;
    token: string | null;
    channelId: string | null;
    threadId?: string;
  };
}
export interface EventReminder {
  active: boolean;
  webhook: {
    id: string;
    token: string;
    channelId: string;
    threadId?: string;
  } | null;
  last_messageId: string | null;
  role: string | null;
}
export interface Reminders {
  active: boolean;
  events: {
    dailies: EventReminder;
    grandma: EventReminder;
    turtle: EventReminder;
    geyser: EventReminder;
    reset: EventReminder;
    eden: EventReminder;
    ts: EventReminder;
    aurora: EventReminder;
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

// #region SpecialEvent

export interface EventData extends Document {
  /** Start date of the event */
  startDate: string;

  /** End date of the event */
  endDate: string;

  /** Name of the event */
  name: string;
}

// #region TS
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

export interface TSValue {
  visiting: boolean;
  name?: string;
  nextVisit: DateTime;
  index?: number;
  duration: string;
  value?: string;
}

// #region Daily quests
export interface DailyQuestsSchema extends Document {
  quests: DailyQuest[];
  last_updated: string;
  last_message?: string;
  rotating_candles: DailyQuest;
  seasonal_candles?: DailyQuest;
}

// #region User
interface SkygameModeShchema {
  singleMode: { gamesPlayed: number; gamesWon: number };
  doubleMode: { gamesPlayed: number; gamesWon: number };
}
interface UserSchema extends Document {
  _id: string;
  data: {
    id: string;
    username: string;
    createdAt: Date;
  };
  language?: {
    name: string;
    value: string;
    flag?: string;
  };
  isBlacklisted: boolean;
  hangman?: SkygameModeShchema;
  scrambled?: SkygameModeShchema;
  linkedRole?: {
    username?: string;
    metadata?: {
      wings?: number;
      since?: string;
      hangout?: boolean;
      cr?: boolean;
      eden?: boolean;
    };
  };
}
