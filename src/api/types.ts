import type { EventsKeys } from "#bot/libs/types";

export type ReminderFeature = {
  active: boolean;
  events: {
    [key in EventsKeys]?: {
      active: boolean;
      channel?: string;
      role?: string | null;
    };
  };
};
export type SpiritData = {
  name: string;
  value: string;
  icon?: string;
};
export type Features = {
  "shards-live": {
    channel?: string;
  };
  "times-live": {
    channel?: string;
  };
  reminders: ReminderFeature;
};
export interface UserInfo {
  language?: string;
}

export interface GuildInfo {
  id?: string;
  name?: string;
  icon?: string | null;
  prefix?: string;
  announcement_channel?: string;
  beta?: boolean;
  language?: string;
  enabledFeatures?: Array<keyof Features>;
}

export interface BotStats {
  totalServers: number;
  totalMembers: number;
  ping: number;
  commands: number;
}

export interface EventData {
  name: string;
  startDate: string;
  endDate: string;
}
export interface TSData {
  spirit: string;
  visitDate: string;
  index: string;
}
