const { ApplicationCommandOptionType } = require("discord.js");
const {convertTime} = require('@handler/functions/timestampHandler');
module.exports = {
    data: {
      name: 'timestamp',
      description: 'Converts time into UNIX timestamp',
      longDesc: `Converts a user-provided time into Unix time, using the default timezone (America/Los_Angeles) unless a different timezone is specified.

Usage:
!timestamp <time> [timezone] [date] [month] [year] [format]

- <time> (required): Specify the time you want to convert.
- [timezone] (optional): Specify a timezone to use for the conversion.
- [date] (optional): Specify a specific date (e.g., "2023-09-15").
- [month] (optional): Specify a specific month (e.g., "9").
- [year] (optional): Specify a specific year (e.g., "2023").
- [format] (optional): Specify the desired output format (e.g., "long-date", "short-date", "long-time-and-date", etc.).`,
      options: [
        {
          name: 'time',
          description: 'The time to convert (format: HH mm ss)',
          type: ApplicationCommandOptionType.String,
          required: true, 
        },
        {
            name: 'timezone',
            description: 'Your timezone in the format: Continent/City',
            type: ApplicationCommandOptionType.String,
            required: false, 
        },
        {
            name: 'date',
            description: 'The date to convert (format: DD)',
            type: ApplicationCommandOptionType.Integer,
            required: false, 
        },
        {
            name: 'month',
            description: 'The month to convert (format: MM)',
            type: ApplicationCommandOptionType.Integer,
            required: false, 
        },
        {
            name: 'year',
            description: 'The year to convert (format: YYYY)',
            type: ApplicationCommandOptionType.Integer,
            required: false, 
        },
        {
            name: 'format',
            description: 'Select a timestamp format',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: 'Date1', value: 'date1' },
                { name: 'Date2', value: 'date2' },
                { name: 'Short Time', value: 'shortTime' },
                { name: 'Long Time', value: 'longTime' },
                { name: 'Short Date and Time', value: 'shortDateAndTime' },
                { name: 'Long Date and Time', value: 'longDateAndTime' },
                { name: 'Relative', value: 'minutes' }
              ],
        },
      ],
    },
    async execute(interaction) {
      await convertTime(interaction);
    },
  };
  