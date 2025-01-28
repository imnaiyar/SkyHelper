import type { Command } from "@/structures/Command";
import { ApplicationCommandOptionType, ApplicationIntegrationType } from "@discordjs/core";

export const GUIDES_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "guides",
  description: "various guides",
  cooldown: 10,
  category: "Info",
  data: {
    name_localizations: "commands:GUIDES.name",
    description_localizations: "commands:GUIDES.description",
    options: [
      {
        name: "seasonal",
        description: "various seasonal guides",
        description_localizations: "commands:GUIDES.options.SEASONAL.description",
        name_localizations: "commands:GUIDES.options.SEASONAL.name",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "season",
            name_localizations: "commands:GUIDES.options.SEASONAL.options.season.name",
            description: "select a season for the guide",
            description_localizations: "commands:GUIDES.options.SEASONAL.options.season.description",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
          },
          {
            name: "type",
            name_localizations: "commands:GUIDES.options.SEASONAL.options.type.name",
            description: "quest, or spirits guides",
            description_localizations: "commands:GUIDES.options.SEASONAL.options.type.description",
            type: ApplicationCommandOptionType.String,
            choices: [
              {
                name: "↪️ Quests",
                name_localizations: "commands:GUIDES.options.SEASONAL.options.type.choices.quests",
                value: "quest",
              },
              {
                name: "↪️ Spirits",
                name_localizations: "commands:GUIDES.options.SEASONAL.options.type.choices.spirits",
                value: "spirits",
              },
            ],
            required: true,
          },
          {
            name: "hide",
            name_localizations: "common:hide-options.name",
            description: "hide the guides from others (default: false)",
            description_localizations: "common:hide-options.description",
            type: ApplicationCommandOptionType.Boolean,
            required: false,
          },
        ],
      },
      {
        name: "realms",
        name_localizations: "commands:GUIDES.options.REALMS.name",
        description: "various realms guides",
        description_localizations: "commands:GUIDES.options.REALMS.description",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "realm",
            name_localizations: "commands:GUIDES.options.REALMS.options.realms.name",
            description: "directly search for a base spirit`s tree/location",
            description_localizations: "commands:GUIDES.options.REALMS.options.realms.description",
            type: ApplicationCommandOptionType.String,
            choices: [
              {
                name: "↪️ Isle of Dawn",
                name_localizations: "commands:GUIDES.options.REALMS.options.realms.choices.isle",
                value: "isle",
              },
              {
                name: "↪️ Daylight Prairie",
                name_localizations: "commands:GUIDES.options.REALMS.options.realms.choices.daylight",
                value: "prairie",
              },
              {
                name: "↪️ Hidden Forest",
                name_localizations: "commands:GUIDES.options.REALMS.options.realms.choices.forest",
                value: "forest",
              },
              {
                name: "↪️ Valley of Triumph",
                name_localizations: "commands:GUIDES.options.REALMS.options.realms.choices.valley",
                value: "valley",
              },
              {
                name: "↪️ Golden Wasteland",
                name_localizations: "commands:GUIDES.options.REALMS.options.realms.choices.wasteland",
                value: "wasteland",
              },
              {
                name: "↪️ Vault of Knowledge",
                name_localizations: "commands:GUIDES.options.REALMS.options.realms.choices.vault",
                value: "vault",
              },
              {
                name: "↪️ Eye of Eden",
                name_localizations: "commands:GUIDES.options.REALMS.options.realms.choices.eden",
                value: "eden",
              },
            ],
            required: true,
          },
          {
            name: "type",
            name_localizations: "commands:GUIDES.options.REALMS.options.type.name",
            description: "summary, maps or spirits guides",
            description_localizations: "commands:GUIDES.options.REALMS.options.type.description",
            type: ApplicationCommandOptionType.String,
            choices: [
              {
                name: "↪️ Realm Summary",
                name_localizations: "commands:GUIDES.options.REALMS.options.type.choices.realm",
                value: "summary",
              },
              {
                name: "↪️ Maps",
                name_localizations: "commands:GUIDES.options.REALMS.options.type.choices.maps",
                value: "maps",
              },
              {
                name: "↪️ Spirits",
                name_localizations: "commands:GUIDES.options.REALMS.options.type.choices.spirits",
                value: "spirits",
              },
            ],
            required: true,
          },
          {
            name: "hide",
            name_localizations: "common:hide-options.name",
            description: "hide the guides from others (default: false)",
            description_localizations: "common:hide-options.description",
            type: ApplicationCommandOptionType.Boolean,
            required: false,
          },
        ],
      },
      // {
      //   name: "events",
      //   description: "various event guides (Days of ...)",
      //   type: ApplicationCommandOptionType.Subcommand,
      //   options: [
      //     {
      //       name: "hide",
      //       description: "hide the guides from others (default: false)",
      //       type: ApplicationCommandOptionType.Boolean,
      //       required: false,
      //     },
      //   ],
      // },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
};

export const SPIRTIS_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "spirits",
  description: "search for spirits",
  data: {
    name_localizations: "commands:SPIRITS.name",
    description_localizations: "commands:SPIRITS.description",
    options: [
      {
        name: "search",
        name_localizations: "commands:SPIRITS.options.name",
        type: ApplicationCommandOptionType.String,
        autocomplete: true,
        description: "search for a spirit",
        description_localizations: "commands:SPIRITS.options.description",
        required: true,
      },
      {
        name: "hide",
        name_localizations: "common:hide-options.name",
        type: ApplicationCommandOptionType.Boolean,
        description: "Hide the response",
        description_localizations: "common:hide-options.description",
        required: false,
      },
    ],
    integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
    contexts: [0, 1, 2],
  },
  cooldown: 5,
  category: "Info",
};
