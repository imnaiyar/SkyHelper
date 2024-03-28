const { ApplicationCommandOptionType } = require("discord.js");
const { convertTime } = require("./sub/timestampHandler");
module.exports = {
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
      {
        name: "format",
        description: "Select a timestamp format",
        type: ApplicationCommandOptionType.String,
        required: false,
        choices: [
          { name: "Date1", value: "date1" },
          { name: "Date2", value: "date2" },
          { name: "Short Time", value: "shortTime" },
          { name: "Long Time", value: "longTime" },
          { name: "Short Date and Time", value: "shortDateAndTime" },
          { name: "Long Date and Time", value: "longDateAndTime" },
          { name: "Relative", value: "minutes" },
        ],
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2], 
  },
  async execute(interaction) {
    await convertTime(interaction);
  },
};
