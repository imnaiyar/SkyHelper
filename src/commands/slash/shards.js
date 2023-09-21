const { ApplicationCommandOptionType } = require("discord.js");
const {shardsAlt} = require('@shards/shardsAlt')
module.exports = {
    data: {
      name: 'shards',
      description: 'Get Sky Shards information',
      longDesc: 'Provides detailed information about shattering shards in Sky: Children of the Light.\n\n`Usage:`\n/shards [date]\n- `[date]:` (Optional) Specify a date to get shard details for that day (e.g., "2023-09-15").\n\nThis command will give you insights into shard locations, landing times, and essential data for the selected date.',
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
  