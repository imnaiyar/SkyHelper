import type { Command } from "@/structures/Command";
import { ApplicationCommandOptionType } from "@discordjs/core";
// #region DailyQuests
export const DAILY_QUESTS_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "daily-quests",
  description: "Get the daily quests for today",
  data: {
    name_localizations: "commands:DAILY_QUESTS.name",
    description_localizations: "commands:DAILY_QUESTS.description",
    options: [
      {
        name: "hide",
        name_localizations: "common:hide-options.name",
        description: "hide the response from others",
        description_localizations: "common:hide-options.description",
        type: ApplicationCommandOptionType.Boolean,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  category: "Info",
  prefix: {
    aliases: ["quests", "quest"],
  },
  cooldown: 15,
};

// #region ShardsCalendar
export const SHARDS_CALENDAR_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "shards-calendar",
  description: "Show the shards calendar",
  prefix: {
    aliases: ["shards-cal", "shard-cal", "sc", "nextshards", "next-shards"],
  },
  data: {
    name_localizations: "commands:SHARDS_CALENDAR.name",
    description_localizations: "commands:SHARDS_CALENDAR.description",
    options: [
      {
        name: "hide",
        name_localizations: "common:hide-options.name",
        description: "hides the response",
        description_localizations: "common:hide-options.description",
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  category: "Info",
  cooldown: 15,
};

// #region Shards
export const SHARDS_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "shards",
  description: "Get the a specific shard information",
  prefix: {
    usage: "[date]",
    aliases: ["shard"],
  },
  data: {
    name_localizations: "commands:SHARDS.name",
    description_localizations: "commands:SHARDS.description",
    options: [
      {
        name: "date",
        name_localizations: "commands:SHARDS.options.DATE.name",
        description: "The date to get the shard information",
        description_localizations: "commands:SHARDS.options.DATE.description",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
      {
        name: "hide",
        name_localizations: "common:hide-options.name",
        description: "Hide the shard response",
        description_localizations: "common:hide-options.description",
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
  data: {
    name_localizations: "commands:SKYTIMES.name",
    description_localizations: "commands:SKYTIMES.description",
    options: [
      {
        name: "hide",
        name_localizations: "common:hide-options.name",
        description: "hides the response",
        description_localizations: "common:hide-options.description",
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
  data: {
    name_localizations: "commands:TRAVELING-SPIRIT.name",
    description_localizations: "commands:TRAVELING-SPIRIT.description",
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  prefix: { aliases: ["ts", "ts-date"] },
  cooldown: 20,
  category: "Info",
};

// #region SkyGamePlanner
export const SKYGAME_PLANNER_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "skygame-planner",
  description: "Access SkyGame Planner data for Sky: Children of the Light",
  data: {
    options: [
      {
        name: "stats",
        description: "Get statistics about the SkyGame Planner data",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "current-ts",
        description: "Get information about the current traveling spirit",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "events",
        description: "Get information about current and upcoming events",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "data",
        description: "Retrieve data by GUID",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "entity",
            description: "Search for an entity by name",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
          },
          {
            name: "hide",
            description: "Hide the response from others",
            type: ApplicationCommandOptionType.Boolean,
            required: false,
          },
        ],
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  category: "Info",
  prefix: {
    aliases: ["skyplanner", "sgp"],
  },
  cooldown: 15,
};
