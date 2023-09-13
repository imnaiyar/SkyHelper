const { ApplicationCommandOptionType } = require("discord.js");
const {shardsAlt} = require('@shards/shardsAlt')
module.exports = {
    data: {
      name: 'shards',
      description: 'Get Sky Shards information',
      longDesc: 'Get information about daily shards. By default it provides details about today\'s shard, but you can search shards detail for a specific date.',
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
  