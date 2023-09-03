const { ApplicationCommandOptionType } = require("discord.js");
const {shardsAlt} = require('@shards/shardsAlt')
module.exports = {
    data: {
      name: 'shards',
      description: 'Get Sky Shards information',
      options: [
        {
          name: 'date',
          description: 'Get Shards data for a specific date. (YYYY-MM-DD, e.g 2023-06-28)',
          type: ApplicationCommandOptionType.String,
          required: false, 
        },
      ],
    },
    async execute(interaction) {
      await shardsAlt(interaction);
    },
  };
  