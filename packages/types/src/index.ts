// Export all schema types
export * from "./schemas/index.js";

// Export API types with prefixes to avoid conflicts
export {
  ReminderFeatureSchema,
  ReminderFeature,
  GuildInfoSchema,
  GuildInfo,
  FeaturesSchema,
  Features,
  SpiritSchema,
  SpiritData,
  UserInfoSchema,
  UserInfo,
  BotStatsSchema,
  BotStats,
  EventDataSchema,
  TSDataSchema,
} from "./api/index.js";

// Renamed exports to avoid conflicts
export { EventData as ApiEventData, TSData as ApiTSData } from "./api/index.js";

// Export utility types with prefixes to avoid conflicts
export {
  LeaderboardOptions,
  ColorsType,
  Background,
  SkyEvent,
  ShardsCountdown,
  EventType,
  SkyGameStatsData,
} from "./utils/index.js";

// Renamed exports to avoid conflicts
export { UserData as GameUserData } from "./utils/index.js";
