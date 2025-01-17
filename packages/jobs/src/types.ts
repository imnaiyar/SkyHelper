import { Document } from "mongoose";

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

