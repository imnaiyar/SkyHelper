import { supportedLang } from "@skyhelperbot/constants";
import { z } from "zod/v4";

// Base reminder feature schema
const ReminderFeatureBaseSchema = z.object({
  active: z.boolean(),
  channelId: z.string().nullable(),
  role: z.string().nullable(),
  offset: z.number().min(1).max(15).nullable(),
});

// Complete reminder feature schema with all reminder types
export const ReminderFeatureSchema = z.object({
  eden: ReminderFeatureBaseSchema,
  dailies: ReminderFeatureBaseSchema,
  grandma: ReminderFeatureBaseSchema,
  turtle: ReminderFeatureBaseSchema,
  geyser: ReminderFeatureBaseSchema,
  reset: ReminderFeatureBaseSchema,
  aurora: ReminderFeatureBaseSchema,
  ts: ReminderFeatureBaseSchema,
  "shards-eruption": ReminderFeatureBaseSchema.extend({
    shard_type: z.array(z.enum(["red", "black"])).nullable(),
  }).refine((data) => !data.active || (data.active && data.shard_type && data.shard_type.length > 0), {
    message: "You must select at least one shard type for the reminder",
    path: ["shard_type"],
  }),
  "fireworks-festival": ReminderFeatureBaseSchema,
});

export type ReminderFeature = z.infer<typeof ReminderFeatureSchema>;

// Guild information schema
export const GuildInfoSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  icon: z.string().nullable().optional(),
  prefix: z.string().optional(),
  announcement_channel: z.string().optional(),
  beta: z.boolean().optional(),
  language: z.enum(supportedLang.map((v: any) => v.value) as [string, ...string[]]).optional(),
  enabledFeatures: z.array(z.enum(["reminders", "live-updates"])).optional(),
});

export type GuildInfo = z.infer<typeof GuildInfoSchema>;

// Features schema
export const FeaturesSchema = z.object({
  "live-updates": z.object({
    shards: z.string().nullable(),
    times: z.string().nullable(),
  }),
  reminders: ReminderFeatureSchema,
});

export type Features = z.infer<typeof FeaturesSchema>;

// Spirit data schema
export const SpiritSchema = z.object({
  name: z.string(),
  value: z.string(),
  icon: z.string().optional(),
});

export type SpiritData = z.infer<typeof SpiritSchema>;

// User information schema
export const UserInfoSchema = z.object({
  language: z.enum(supportedLang.map((v: any) => v.value) as [string, ...string[]]).optional(),
});

export type UserInfo = z.infer<typeof UserInfoSchema>;

// Bot statistics schema
export const BotStatsSchema = z.object({
  totalServers: z.number(),
  totalMembers: z.number(),
  ping: z.number(),
  commands: z.number(),
  totalUserInstalls: z.number(),
});

export type BotStats = z.infer<typeof BotStatsSchema>;

// Event data schema
export const EventDataSchema = z.object({
  name: z.string(),
  startDate: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, "Date must be in the format DD-MM-YYYY"),
  endDate: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, "Date must be in the format DD-MM-YYYY"),
});

export type EventData = z.infer<typeof EventDataSchema>;

// Traveling Spirit data schema
export const TSDataSchema = z.object({
  spirit: z.string(),
  visitDate: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, "Date must be in the format DD-MM-YYYY"),
  index: z.string(),
});

export type TSData = z.infer<typeof TSDataSchema>;
