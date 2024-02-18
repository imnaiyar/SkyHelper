const { ApplicationCommandOptionType, ButtonBuilder, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const { handleSeasonal, HandleRealms, handleEvents } = require("./sub/index");
const { getRealmsRow } = require("./sub/shared/helpers.js");
const summary = require("./sub/extends/realms/summaries.js");
const desc = require("@src/cmdDesc");
let reply;
module.exports = {
  cooldown: 3,
  data: {
    name: "guides",
    description: "various guides",
    longDesc: desc.guides,
    options: [
      {
        name: "seasonal",
        description: "various seasonal guides",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "spirit",
            description: "directly search for a seasonal spirit`s tree/location",
            type: ApplicationCommandOptionType.String,
            required: false,
            autocomplete: true,
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
                name: "Isle of Dawn",
                value: "isle",
              },
              {
                name: "Daylight Prairie",
                value: "prairie",
              },
              {
                name: "Hidden Forest",
                value: "forest",
              },
              {
                name: "Valley of Triumph",
                value: "valley",
              },
              {
                name: "Golden Wasteland",
                value: "wasteland",
              },
              {
                name: "Vault of Knowledge",
                value: "vault",
              },
              {
                name: "Eye of Eden",
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
                name: "Realm Summary",
                value: "summary",
              },
              {
                name: "Maps",
                value: "maps",
              },
              {
                name: "spirits",
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
        name: "events",
        description: "various event guides (Days of ...)",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "hide",
            description: "hide the guides from others (default: false)",
            type: ApplicationCommandOptionType.Boolean,
            required: false,
          },
        ],
      },
    ],
  },
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const ephmrl = interaction.options.getBoolean("hide");
    const ephemeral = ephmrl !== null ? ephmrl : false;
    reply = await interaction.deferReply({ ephemeral: ephemeral, fetchReply: true });
    switch (sub) {
      case "seasonal": {
        await handleSeasonal(interaction, ephemeral);
        break;
      }
      case "realms": {
        const realmValue = interaction.options.getString("realm");
        const type = interaction.options.getString("type");
        if (!realmValue || !type) {
          interaction.followUp("You need to provide both `realm` and `type` options");
        }
        const realm = this.data.options[1].options[0].choices.find((v) => v.value === realmValue)?.name;
        const value = `${type}_${realmValue}`;
        await new HandleRealms(interaction, realm, value, reply).respond();
        break;
      }
      case "events": {
        await handleEvents(interaction, ephemeral);
        break;
      }
    }
  },
  async autocomplete(interaction, client) {
    const focusedValue = interaction.options.getFocused();
    const sub = interaction.options.getSubcommand();
  },
};
