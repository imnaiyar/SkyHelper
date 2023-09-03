const { ApplicationCommandOptionType } = require("discord.js");
const {Guides} = require('@guides/GuideOption')
module.exports = {
    data: {
      name: 'seasonal-guides',
      description: 'Seasonal Guides.(Quests/Spirit Locations/TS Price Tree)',
      options: [
        {
          name: 'ephemeral',
          description: 'Turns Ephemeral false if you want the results to be visible to others',
          type: ApplicationCommandOptionType.String,
          required: false,
          choices: [
            { name: 'False', value: 'false' }
          ] 
        },
      ],
    },
    async execute(interaction) {
      await Guides(interaction);
    },
  };
  