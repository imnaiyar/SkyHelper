import type { DateTime } from "luxon";
import type { Document } from "mongoose";
import type { REMINDERS_KEY } from "@skyhelperbot/constants";

// Common data structures
export interface LanguageData {
  name: string;
  value: string;
  flag?: string;
}

export interface GuildData {
  name: string;
  region: string;
  owner: string;
  joinedAt: Date;
  leftAt: Date;
  bots: number;
}

export interface UserData {
  id: string;
  username: string;
  createdAt: Date;
}

// Game mode schemas
export interface SkyGameModeSchema {
  singleMode: { gamesPlayed: number; gamesWon: number };
  doubleMode: { gamesPlayed: number; gamesWon: number };
}

// Reminder and update configurations
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

export interface ReminderConfig {
  active: boolean;
  webhook?: {
    id: string;
    token: string;
    channelId: string;
    threadId?: string;
  } | null;
  last_messageId?: string | null;
  offset?: number | null;
  role: string | null;
}

export type ReminderConfigWithShards = ReminderConfig & { shard_type: ("red" | "black")[] };

export interface Reminders {
  active: boolean;
  default_role: string | null;
  events: {
    [k in (typeof REMINDERS_KEY)[number]]: (k extends "shards-eruption" ? ReminderConfigWithShards : ReminderConfig) | null;
  };
}

// Document schemas (mongoose)
export interface UserSchema extends Document {
  _id: string;
  data: UserData;
  language?: LanguageData;
  isBlacklisted: boolean;
  hangman?: SkyGameModeSchema;
  scrambled?: SkyGameModeSchema;
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

export interface GuildSchema extends Document {
  _id: string;
  data: GuildData;
  annoucement_channel: string | null;
  beta: boolean;
  prefix: string;
  language?: LanguageData;
  reminders: Reminders;
  autoShard: LiveUpdates;
  autoTimes: LiveUpdates;
}

export interface EventData extends Document {
  /** Start date of the event */
  startDate: string;
  /** End date of the event */
  endDate: string;
  /** Name of the event */
  name: string;
}

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

/** Represents a daily quest data */
export interface DailyQuest {
  /** Title for the quest */
  title: string;
  /** The date this quest was saved on */
  date: string;
  /** Description for the quest (if any) */
  description?: string;
  /** Image guide for the quest (if any) */
  images: {
    url: string;
    /** Credit for the guide */
    by: string;
    /** Source of the guide */
    source?: string;
  }[];
}

export interface DailyQuestsSchema extends Document {
  quests: DailyQuest[];
  last_updated: string;
  last_message?: string;
  rotating_candles: DailyQuest;
  seasonal_candles?: DailyQuest;
}
