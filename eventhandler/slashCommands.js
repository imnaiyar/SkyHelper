const { REST } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const { clientId, token } = require('../config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');

const rest = new REST({ version: '9' }).setToken(token);

async function createSlashCommands() {
  try {
    
    const shardsALt = new SlashCommandBuilder()
      .setName('shards')
      .setDescription('Get Sky Shards information')
      .addStringOption(option =>
        option.setName('date')
          .setDescription('Get Shards data for a specific date. (YYYY-MM-DD, e.g 2023-06-28)')
          .setRequired(false))
       .toJSON();
   const seasonGuide = new SlashCommandBuilder()
      .setName('seasonal-guides')
      .setDescription('Seasonal Guides.(Quests/Spirit Locations/TS Price Tree)')
      .addStringOption(option =>
        option
          .setName('ephemeral')
          .setDescription('Turns Ephemeral false if you want the results to be visible to others')
          .addChoices(
            { name: 'False', value: 'false' })
          .setRequired(false))
       .toJSON();
  
  const testCommand = new SlashCommandBuilder()
      .setName('help')
      .setDescription('Get the List of Slash and Prefix commands.')
       .toJSON();
       
  
       
    const timestampCommandData = new SlashCommandBuilder()
      .setName('timestamp')
      .setDescription('Converts time into UNIX timestamp')
      .addStringOption(option =>
        option
          .setName('time')
          .setDescription('The time to convert (format: HH mm ss)')
          .setRequired(true))
      .addStringOption(option =>
        option
          .setName('timezone')
          .setDescription('Your timezone in the format: Continent/City')
          .setRequired(false))
      .addIntegerOption(option =>
        option
          .setName('date')
          .setDescription('The date to convert (format: DD)')
          .setRequired(false))
      .addStringOption(option =>
        option
          .setName('month')
          .setDescription('The month to convert (format: MM)')
          .setRequired(false))
      .addIntegerOption(option =>
        option
          .setName('year')
          .setDescription('The year to convert (format: YYYY)')
          .setRequired(false))
      .addStringOption(option =>
        option
          .setName('format')
          .setDescription('Select a timestamp format')
          .addChoices(
            { name: 'Date1', value: 'date1' },
            { name: 'Date2', value: 'date2' },
            { name: 'Short Time', value: 'shortTime' },
            { name: 'Long Time', value: 'longTime' },
            { name: 'Short Date and Time', value: 'shortDateAndTime' },
            { name: 'Long Date and Time', value: 'longDateAndTime' },
            { name: 'Minutes', value: 'minutes' }
          )
          .setRequired(false))
      .toJSON();

    const timesSlash = new SlashCommandBuilder()
     .setName('sky-times')
     .setDescription('Get various times related to the world of Sky')
     .addStringOption(option =>
      option
        .setName('times')
        .setDescription('Select a specific time you want.')
        .addChoices(
          { name: 'Geyser Time', value: 'geyser' },
          { name: 'Grandma Time', value: 'grandma' },
          { name: 'Turtle Time', value: 'turtle' },
          { name: 'Reset Time', value: 'reset' },
          { name: 'Eden Reset Time', value: 'eden' }
          )
          .setRequired(false))
    .toJSON();

await rest.put(
  Routes.applicationCommands(process.env.CLIENT_ID),
  { body: [timestampCommandData, timesSlash, shardsALt, seasonGuide, testCommand] }
);

    console.log('Slash commands created successfully!');
  } catch (error) {
    console.error('Failed to create slash commands:', error);
  }
}

module.exports = {
  createSlashCommands,
};
