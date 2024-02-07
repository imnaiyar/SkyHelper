const { ApplicationCommandOptionType } = require("discord.js");
const { handleSeasonal, handleRealms, handleEvents } = require("./sub/index");
const spirits = require("./sub/extends/spiritsIndex.js");
const desc = require("@src/cmdDesc");
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
            name: "spirit",
            description: "directly search for a base spirit`s tree/location",
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

    switch (sub) {
      case "seasonal":
        await handleSeasonal(interaction);
        break;
      case "realms":
        await handleRealms(interaction);
        break;
      case "events":
        await handleEvents(interaction);
        break;
    }
  },
  async autocomplete(interaction, client) {
    const focusedValue = interaction.options.getFocused(true);
    const spiritNames = Object.keys(spirits);
    const filtered = spiritNames
      .filter((choice) => choice.toUpperCase().includes(focusedValue.toUpperCase()))
      .slice(0, 25);
    await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
  },
};
