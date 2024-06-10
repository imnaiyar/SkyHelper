export type ReminderFeature = {
  channel?: string;
  default_role?: string;
  geyser?: boolean;
  grandma?: boolean;
  turtle?: boolean;
  reset?: boolean;
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
