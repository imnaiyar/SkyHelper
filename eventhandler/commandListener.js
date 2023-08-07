const { timestampInteraction, skyTimes, shardsALt, shardsInteraction} = require('./eventHandlers');
const moment = require('moment-timezone')
const {Permissions, PermissionsBitField} = require('discord.js');
const {nextRedEvents} = require('../interactionhandler/shards/nextRed.js')
const {nextEvent} = require('../interactionhandler/UpcomingEvents.js')
const config = require('../config.json');
 async function slashListener(interaction) {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === 'shardsalt') {
    const {  member } = interaction;
    const hasSpecificRole = member.roles.cache.some(role => role.name === 'shards');
    const hasAdministratorPermission = member.permissions.has(PermissionsBitField.Flags.Administrator);

    if (!(hasSpecificRole || hasAdministratorPermission)) {
    interaction.reply({
      content: 'You do not have the necessary permissions to use this command.',
      ephemeral: true
    });
    return;
  }



  } else if (interaction.commandName === 'timestamp') {
    timestampInteraction(interaction);
    const nickname = interaction.member.displayName;

  const userID = interaction.user.id;

  const time = moment.tz('Asia/Kolkata')

console.log(`User ${nickname} (${userID}) used the 'Timestamp' command. at ${time} `);
  } else if (interaction.commandName === 'test1') {
    await interaction.reply({ content: 'Nothing to test at the moment.', ephemeral: true});
  } else if (interaction.commandName === 'sky-times') {
     skyTimes(interaction);
      const nickname = interaction.member.displayName;

  const userID = interaction.user.id;

  const time = moment.tz('Asia/Kolkata')

console.log(`User ${nickname} (${userID}) used the 'Sky-Times' command. at ${time} `);
  }
    else if (interaction.commandName === 'shards') {
   shardsALt(interaction);
   const nickname = interaction.member.displayName;
  const userID = interaction.user.id;
  const time = moment.tz('Asia/Kolkata')
console.log(`User ${nickname} (${userID}) used the 'Shards' command. at ${time} `);

  } else if (interaction.commandName === 'red-shards') {
    nextRedEvents(interaction)
 }
 };

function prefixListener(message){
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'skytimes') {
    skyTimes(undefined, message, args);
  } else
   if (command === 'sayhi') {
    message.author.send('Hi');}

  }

  module.exports = { slashListener, prefixListener}