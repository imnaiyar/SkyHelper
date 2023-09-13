const { ApplicationCommandOptionType } = require("discord.js");
const {Guides} = require('@guides/GuideOption')
module.exports = {
    data: {
      name: 'seasonal-guides',
      description: 'various seasonal guides',
      longDesc: 'Search from various seasonal guides. You can look for  seasonal quests, spirits location and spirits firendship tree (seasonal tree is displayed if the spirit has not returned yet).',
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
  