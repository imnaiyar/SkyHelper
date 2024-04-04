import { ApplicationCommandOptionType } from 'discord.js';
import { convertTime } from './sub/timestampHandler';

export default {
  cooldown: 3,
  data: {
    name: "timestamp",
    description: "Converts time into UNIX timestamp",
    options: [
      {
        name: "time",
        description: "The time to convert (format: HH mm ss)",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "timezone",
        description: "Your timezone in the format: Continent/City",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
      {
        name: "date",
        description: "The date to convert (format: DD)",
        type: ApplicationCommandOptionType.Integer,
        required: false,
      },
      {
        name: "month",
        description: "The month to convert (format: MM)",
        type: ApplicationCommandOptionType.Integer,
        required: false,
      },
      {
        name: "year",
        description: "The year to convert (format: YYYY)",
        type: ApplicationCommandOptionType.Integer,
        required: false,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  async execute(interaction) {
    await convertTime(interaction);
  },
};
