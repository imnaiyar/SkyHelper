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
] as const;

export { default as seasonsData, SeasonData } from "./seasonsData.js";
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
