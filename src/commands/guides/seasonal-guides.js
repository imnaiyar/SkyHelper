const { ApplicationCommandOptionType } = require('discord.js');
const { Guides } = require('./sub/GuideOption');
const spirits = require('./sub/spiritsIndex.js');
const desc = require('@src/cmdDesc');
module.exports = {
  cooldown: 3,
  data: {
    name: 'seasonal-guides',
    description: 'various seasonal guides',
    longDesc: desc.guides,
    options: [
      {
        name: 'spirit',
        description: 'directly search for a spirit`s tree/location',
        type: ApplicationCommandOptionType.String,
        required: false,
        autocomplete: true,
      },
      {
        name: 'hide',
        description: 'hide the guides from others (default: false)',
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
    ],
  },
  async execute(interaction) {
    await Guides(interaction);
  },
  async autocomplete(interaction, client) {
    const focusedValue = interaction.options.getFocused();
    const spiritNames = Object.keys(spirits);
    const filtered = spiritNames
      .filter((choice) =>
        choice.toUpperCase().includes(focusedValue.toUpperCase()),
      )
      .slice(0, 25);
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice })),
    );
  },
};
