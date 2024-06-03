import { seasonsData } from "#libs/index";
import type { SlashCommand } from "#structures";
import { ApplicationCommandOptionType } from "discord.js";
import { handleSeasional } from "./sub/handleSeasional.js";
import { handleRealms } from "./sub/handleRealms.js";

export default {
  cooldown: 10,
  category: "Guides",
  data: {
    name: "guides",
    description: "various guides",
    options: [
      {
        name: "seasonal",
        description: "various seasonal guides",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "season",
            description: "select a season for the guide",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
          },
          {
            name: "type",
            description: "quest, or spirits guides",
            type: ApplicationCommandOptionType.String,
            choices: [
              {
                name: "↪️ Quests",
                value: "quest",
              },
              {
                name: "↪️ Spirits",
                value: "spirits",
              },
            ],
            required: true,
          },
          {
            name: "hide",
            description: "hide the guides from others (default: false)",
            type: ApplicationCommandOptionType.Boolean,
            required: false,
          },
        ],
      },
      {
        name: "realms",
        description: "various realms guides",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "realm",
            description: "directly search for a base spirit`s tree/location",
            type: ApplicationCommandOptionType.String,
            choices: [
              {
                name: "↪️ Isle of Dawn",
                value: "isle",
              },
              {
                name: "↪️ Daylight Prairie",
                value: "prairie",
              },
              {
                name: "↪️ Hidden Forest",
                value: "forest",
              },
              {
                name: "↪️ Valley of Triumph",
                value: "valley",
              },
              {
                name: "↪️ Golden Wasteland",
                value: "wasteland",
              },
              {
                name: "↪️ Vault of Knowledge",
                value: "vault",
              },
              {
                name: "↪️ Eye of Eden",
                value: "eden",
              },
            ],
            required: true,
          },
          {
            name: "type",
            description: "summary, maps or spirits guides",
            type: ApplicationCommandOptionType.String,
            choices: [
              {
                name: "↪️ Realm Summary",
                value: "summary",
              },
              {
                name: "↪️ Maps",
                value: "maps",
              },
              {
                name: "↪️ Spirits",
                value: "spirits",
              },
            ],
            required: true,
          },
          {
            name: "hide",
            description: "hide the guides from others (default: false)",
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
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    await interaction.deferReply({ ephemeral: interaction.options.getBoolean("hide") ?? false });
    switch (sub) {
      case "seasonal": {
        await handleSeasional(interaction);
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
} satisfies SlashCommand<true>;
