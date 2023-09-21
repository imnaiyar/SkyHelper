const { ApplicationCommandOptionType } = require("discord.js");
const {Guides} = require('@guides/GuideOption')
module.exports = {
    data: {
      name: 'seasonal-guides',
      description: 'various seasonal guides',
      longDesc: `Provides guides for seasonal quests, locations of seasonal spirits, and their cosmetic price trees, created by fellow game players and including their credits. Results are ephemeral by default, but you can make them non-ephemeral optionally (only the results, select menu will still be ephemeral).

\`Usage:\`
/seasonal-guides [ephemeral]

- [ephemeral] (optional): Specify this option to receive non-ephemeral results.`,
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
  