import { ChannelType } from "discord-api-types/v10";

export const supportedLang = [
  {
    name: "English",
    value: "en-US",
    flag: "🇺🇸",
  },
  {
    name: "Hindi (हिन्दी)",
    value: "hi",
    flag: "🇮🇳",
  },
  {
    name: "Russian (русский)",
    value: "ru",
    flag: "🇷🇺",
  },
  {
    name: "Japanese (日本語)",
    value: "ja",
    flag: "🇯🇵",
  },
  {
    name: "Spanish (Español)",
    value: "es-ES",
    flag: "🇪🇸",
  },
] as const;

export { default as seasonsData, type SeasonData } from "./seasonsData.js";
export * from "./hangman.js";
export * from "./seasonsData.js";
export * from "./realmsData.js";
export * from "./scramble.js";
export * from "./emojis.js";
export const SendableChannels = [
  ChannelType.GuildText,
  ChannelType.PrivateThread,
  ChannelType.PublicThread,
  ChannelType.DM,
  ChannelType.GuildVoice,
];

/** Timezone where TGC is based on */
export const zone = "America/Los_Angeles";
export const RemindersEventsMap: Record<string, string> = {
  eden: "Eden/Weekly Reset",
  geyser: "Geyser",
  grandma: "Grandma",
  turtle: "Turtle",
  dailies: "Daily Quests",
  ts: "Traveling Spirit",
  aurora: "Aurora's Concert",
  reset: "Daily Reset",
  "fireworks-festival": "Aviary Fireworks Festival",
  "shards-eruption": "Shards Eruption",
};

export const REMINDERS_KEY = [
  "eden",
  "ts",
  "dailies",
  "aurora",
  "geyser",
  "grandma",
  "reset",
  "turtle",
  "fireworks-festival",
  "shards-eruption",
] as const;

export * as SkyPlannerData from "./skygame-planner/index.js";
