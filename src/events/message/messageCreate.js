const { WebhookClient, Collection } = require("discord.js");
const { client } = require('@root/main');
const fs = require('fs');
const path = require('path');

const Logger = process.env.COMMANDS_USED ? new WebhookClient({ url: process.env.COMMANDS_USED }) : undefined;

prefix = new Collection();

const commandDirectory = path.join(__dirname, '../../commands/prefix');
const commandFiles = fs.readdirSync(commandDirectory).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`@src/commands/prefix/${file}`);
  prefix.set(command.name, command); // Assuming each command module has a 'name' property
}
/**
 * @param {import('@root/main')} client
 * @param {import('discord.js').Message} message
 */
module.exports = async (client, message) => {
  if (message.author.bot || !message.content.startsWith(process.env.PREFIX)) {
    return;
  }

  const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = prefix.get(commandName);

  if (!command) {
    // Handle unknown command
    return message.reply('Unknown command. Use `!help` to see available commands.');
  }

  try {
    // Execute the command
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    // Handle any errors that occur during command execution
    message.reply('An error occurred while executing the command.');
  }
}
