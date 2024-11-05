import { useTranslations as x } from "#bot/handlers/useTranslation";
import type { Command } from "#bot/structures/Command";
import { ApplicationCommandOptionType } from "discord.js";

// #region DailyQuests
export const DAILY_QUESTS_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "daily-quests",
  description: "Get the daily quests for today",
  slash: {
    name_localizations: x("commands:DAILY_QUESTS.name"),
    description_localizations: x("commands:DAILY_QUESTS.description"),
    options: [
      {
        name: "hide",
        name_localizations: x("common:hide-options.name"),
        description: "hide the response from others",
        description_localizations: x("common:hide-options.description"),
        type: ApplicationCommandOptionType.Boolean,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  category: "Info",
  cooldown: 15,
};

// #region ShardsCalendar
export const SHARDS_CALENDAR_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "shards-calendar",
  description: "Show the shards calendar",
  prefix: {
    aliases: ["shards-cal", "shard-cal", "sc", "nextshards", "next-shards"],
  },
  slash: {
    name_localizations: x("commands:SHARDS_CALENDAR.name"),
    description_localizations: x("commands:SHARDS_CALENDAR.description"),
    options: [
      {
        name: "hide",
        name_localizations: x("common:hide-options.name"),
        description: "hides the response",
        description_localizations: x("common:hide-options.description"),
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
};

// #region Shards
export const SHARDS_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "shards",
  description: "Get the a specific shard information",
  prefix: {
    usage: "[date]",
    aliases: ["shard"],
  },
  slash: {
    name_localizations: x("commands:SHARDS.name"),
    description_localizations: x("commands:SHARDS.description"),
    options: [
      {
        name: "date",
        name_localizations: x("commands:SHARDS.options.DATE.name"),
        description: "The date to get the shard information",
        description_localizations: x("commands:SHARDS.options.DATE.description"),
        type: ApplicationCommandOptionType.String,
        required: false,
      },
      {
        name: "hide",
        name_localizations: x("common:hide-options.name"),
        description: "Hide the shard response",
        description_localizations: x("common:hide-options.description"),
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  category: "Info",
  cooldown: 30,
};

// #region Skytimes
export const SKYTIMES_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "skytimes",
  description: "various in-game events countdown",
  slash: {
    name_localizations: x("commands:SKYTIMES.name"),
    description_localizations: x("commands:SKYTIMES.description"),
    options: [
      {
        name: "hide",
        name_localizations: x("common:hide-options.name"),
        description: "hides the response",
        description_localizations: x("common:hide-options.description"),
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  prefix: {
    aliases: ["eventtimes", "sky-times", "skyt"],
  },
  category: "Info",
  cooldown: 20,
};

// #region TravelingSpirits
export const TRAVELING_SPIRITS_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "traveling-spirit",
  description: "get details about current/upcoming TS.",
  slash: {
    name_localizations: x("commands:TRAVELING-SPIRIT.name"),
    description_localizations: x("commands:TRAVELING-SPIRIT.description"),
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  prefix: { aliases: ["ts", "ts-date"] },
  cooldown: 20,
  category: "Info",
};
