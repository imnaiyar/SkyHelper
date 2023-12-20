const { ApplicationCommandOptionType } = require('discord.js');
const { shardsReply } = require('@shards/sub/shardsReply');
const moment = require('moment-timezone');
const desc = require('@src/cmdDesc');
module.exports = {
  cooldown: 3,
  data: {
    name: 'shards',
    description: 'Get Sky Shards information',
    longDesc: desc.shards,
    options: [
      {
        name: 'date',
        description:
          'Get Shards data for a specific date. (YYYY-MM-DD, e.g 2023-06-28)',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },
  async execute(interaction) {
    const timezone = 'America/Los_Angeles';
    const dateOption = interaction.options.getString('date');

    const regex = /^\d{4,6}-\d{2}-\d{2}$/;

    if (dateOption && !regex.test(dateOption)) {
      interaction.reply({
        content:
          'Invalid date format. Please use the YYYY-MM-DD format. Max input : **275760-09-12**',
        ephemeral: true,
      });
      return;
    }
    let currentDate;
    try {
      if (dateOption) {
        currentDate = moment.tz(dateOption, 'Y-MM-DD', timezone).startOf('day');

        if (!currentDate.isValid()) {
          await interaction.reply({
            content: `\` ${dateOption} \` does not exist, please provide a valid date.`,
            ephemeral: true,
          });
          return;
        }
      } else {
        currentDate = moment().tz(timezone);
      }
    } catch (error) {
      await interaction.reply('An error occurred while processing the date.');
      return;
    }
    await shardsReply(interaction, currentDate);
  },
};
