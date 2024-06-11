export type ReminderFeature = {
  channel?: string;
  default_role?: string;
  geyser?: boolean;
  grandma?: boolean;
  turtle?: boolean;
  reset?: boolean;
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
export interface GuildInfo {
  id: string;
  name: string;
  icon: string | null;
  enabledFeatures: Array<keyof Features>;
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
  spiritImage: string;
  index: string;
}
