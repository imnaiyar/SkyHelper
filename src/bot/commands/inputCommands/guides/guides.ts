import { seasonsData } from "#libs/index";
import type { Command } from "#structures";
import { ApplicationCommandOptionType } from "discord.js";
import { handleSeasional } from "./sub/handleSeasional.js";
import { handleRealms } from "./sub/handleRealms.js";
import { useTranslations as x } from "#handlers/useTranslation";
export default {
  async interactionRun(interaction, t) {
    const sub = interaction.options.getSubcommand();
    await interaction.deferReply({ ephemeral: interaction.options.getBoolean("hide") ?? false });
    switch (sub) {
      case "seasonal": {
        await handleSeasional(interaction, t);
        break;
      }
      case "realms": {
        await handleRealms(interaction);
        break;
      }
    }
  },
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused(true);
    const sub = interaction.options.getSubcommand();

    if (sub === "seasonal" && focusedValue.name === "season") {
      // EmojisMap contain all the season name, so get it from there
      const choices = Object.entries(seasonsData).filter(([, v]) =>
        v.name.toLowerCase().includes(focusedValue.value.toLowerCase()),
      );
      await interaction.respond(
        choices.map(([k, v]) => ({
          name: `↪️ Season of ${v.name}`,
          value: k.toString(),
        })),
      );
    }
  },
  name: "guides",
  description: "various guides",
  cooldown: 10,
  category: "Guides",
  slash: {
    name_localizations: x("commands.GUIDES.name"),
    description_localizations: x("commands.GUIDES.description"),
    options: [
      {
        name: "seasonal",
        description: "various seasonal guides",
        description_localizations: x("commands.GUIDES.options.SEASONAL.description"),
        name_localizations: x("commands.GUIDES.options.SEASONAL.name"),
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "season",
            name_localizations: x("commands.GUIDES.options.SEASONAL.options.season.name"),
            description: "select a season for the guide",
            description_localizations: x("commands.GUIDES.options.SEASONAL.options.season.description"),
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
          },
          {
            name: "type",
            name_localizations: x("commands.GUIDES.options.SEASONAL.options.type.name"),
            description: "quest, or spirits guides",
            description_localizations: x("commands.GUIDES.options.SEASONAL.options.type.description"),
            type: ApplicationCommandOptionType.String,
            choices: [
              {
                name: "↪️ Quests",
                name_localizations: x("commands.GUIDES.options.SEASONAL.options.type.choices.quests"),
                value: "quest",
              },
              {
                name: "↪️ Spirits",
                name_localizations: x("commands.GUIDES.options.SEASONAL.options.type.choices.spirits"),
                value: "spirits",
              },
            ],
            required: true,
          },
          {
            name: "hide",
            name_localizations: x("common.hide-options.name"),
            description: "hide the guides from others (default: false)",
            description_localizations: x("common.hide-options.description"),
            type: ApplicationCommandOptionType.Boolean,
            required: false,
          },
        ],
      },
      {
        name: "realms",
        name_localizations: x("commands.GUIDES.options.REALMS.name"),
        description: "various realms guides",
        description_localizations: x("commands.GUIDES.options.REALMS.description"),
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "realm",
            name_localizations: x("commands.GUIDES.options.REALMS.options.realms.name"),
            description: "directly search for a base spirit`s tree/location",
            description_localizations: x("commands.GUIDES.options.REALMS.options.realms.description"),
            type: ApplicationCommandOptionType.String,
            choices: [
              {
                name: "↪️ Isle of Dawn",
                name_localizations: x("commands.GUIDES.options.REALMS.options.realms.choices.isle"),
                value: "isle",
              },
              {
                name: "↪️ Daylight Prairie",
                name_localizations: x("commands.GUIDES.options.REALMS.options.realms.choices.daylight"),
                value: "prairie",
              },
              {
                name: "↪️ Hidden Forest",
                name_localizations: x("commands.GUIDES.options.REALMS.options.realms.choices.forest"),
                value: "forest",
              },
              {
                name: "↪️ Valley of Triumph",
                name_localizations: x("commands.GUIDES.options.REALMS.options.realms.choices.valley"),
                value: "valley",
              },
              {
                name: "↪️ Golden Wasteland",
                name_localizations: x("commands.GUIDES.options.REALMS.options.realms.choices.wasteland"),
                value: "wasteland",
              },
              {
                name: "↪️ Vault of Knowledge",
                name_localizations: x("commands.GUIDES.options.REALMS.options.realms.choices.vault"),
                value: "vault",
              },
              {
                name: "↪️ Eye of Eden",
                name_localizations: x("commands.GUIDES.options.REALMS.options.realms.choices.eden"),
                value: "eden",
              },
            ],
            required: true,
          },
          {
            name: "type",
            name_localizations: x("commands.GUIDES.options.REALMS.options.type.name"),
            description: "summary, maps or spirits guides",
            description_localizations: x("commands.GUIDES.options.REALMS.options.type.description"),
            type: ApplicationCommandOptionType.String,
            choices: [
              {
                name: "↪️ Realm Summary",
                name_localizations: x("commands.GUIDES.options.REALMS.options.type.choices.realm"),
                value: "summary",
              },
              {
                name: "↪️ Maps",
                name_localizations: x("commands.GUIDES.options.REALMS.options.type.choices.maps"),
                value: "maps",
              },
              {
                name: "↪️ Spirits",
                name_localizations: x("commands.GUIDES.options.REALMS.options.type.choices.spirits"),
                value: "spirits",
              },
            ],
            required: true,
          },
          {
            name: "hide",
            name_localizations: x("common.hide-options.name"),
            description: "hide the guides from others (default: false)",
            description_localizations: x("common.hide-options.description"),
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
} satisfies Command<true>;
