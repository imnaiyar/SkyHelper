const { ApplicationCommandOptionType } = require("discord.js");
const {skyTimes} = require('@handler/skyTimes')
module.exports = {
    data: {
      name: 'sky-times',
      description: 'Get various times related to the world of Sky',
      options: [
        {
          name: 'times',
          description: 'Select a specific time you want.',
          type: ApplicationCommandOptionType.String,
          required: false, 
          choices: [
          { name: 'Geyser Time', value: 'geyser' },
          { name: 'Grandma Time', value: 'grandma' },
          { name: 'Turtle Time', value: 'turtle' },
          { name: 'Reset Time', value: 'reset' },
          { name: 'Eden Reset Time', value: 'eden' }
          ]
        },
      ],
    },
    async execute(interaction, args) {
      await skyTimes(interaction, args);
    },
  };
  