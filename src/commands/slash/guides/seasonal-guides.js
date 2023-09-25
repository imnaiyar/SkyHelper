const { ApplicationCommandOptionType } = require("discord.js");
const {Guides} = require('./sub/GuideOption')
const desc = require('@commands/cmdDesc')
module.exports = {
    data: {
      name: 'seasonal-guides',
      description: 'various seasonal guides',
      longDesc: desc.guides,
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
  