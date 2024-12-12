import { z } from "zod";

const ReminderFeatureBaseSchema = z.object({
  active: z.boolean(),
  channel: z.string().optional(),
  role: z.string().nullable().optional(),
});

export const ReminderFeatureSchema = z.object({
  eden: ReminderFeatureBaseSchema.optional(),
  dailies: ReminderFeatureBaseSchema.optional(),
  grandma: ReminderFeatureBaseSchema.optional(),
  turtle: ReminderFeatureBaseSchema.optional(),
  geyser: ReminderFeatureBaseSchema.optional(),
  reset: ReminderFeatureBaseSchema.optional(),
});

export type ReminderFeature = z.infer<typeof ReminderFeatureSchema>;

export const GuildInfoSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  icon: z.string().nullable().optional(),
  prefix: z.string().optional(),
  announcement_channel: z.string().optional(),
  beta: z.boolean().optional(),
  language: z.string().optional(),
  enabledFeatures: z.array(z.enum(["shards-live", "times-live", "reminders"])).optional(),
});
export type GuildInfo = z.infer<typeof GuildInfoSchema>;

export const FeaturesSchema = z.object({
  "shards-live": z.object({
    channel: z.string().optional(),
  }),
  "times-live": z.object({
    channel: z.string(),
  }),
  reminders: ReminderFeatureSchema,
});

export type Features = z.infer<typeof FeaturesSchema>;

export const SpiritSchema = z.object({
  name: z.string(),
  value: z.string(),
  icon: z.string().optional(),
});

export type SpiritData = z.infer<typeof SpiritSchema>;

export interface UserInfo {
  language?: string;
}

export interface BotStats {
  totalServers: number;
  totalMembers: number;
  ping: number;
  commands: number;
}

export const EventDataSchema = z.object({
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

export type EventData = z.infer<typeof EventDataSchema>;

export const TSDataSchema = z.object({
  spirit: z.string(),
  visitDate: z.string(),
  index: z.string(),
});

export type TSData = z.infer<typeof TSDataSchema>;
