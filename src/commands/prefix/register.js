const { REST } = require('@discordjs/rest');
const fs = require('fs');
const path = require('path');
const { Routes } = require('discord-api-types/v9');
const Logger = require('@src/logger');
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

const commandDirectory = path.join(__dirname, '../slash');
const commands = [];

// Function to recursively search for command files
function findCommandFiles(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory()) {
      // If it's a directory and not named "sub," recursively search it
      if (file !== 'sub') {
        findCommandFiles(filePath);
      }
    } else if (file.endsWith('.js')) {
      const command = require(filePath);
      commands.push(command.data);
    }
  }
}

// Start the search from the "commandDirectory"
findCommandFiles(commandDirectory);

module.exports = {
  data: {
    name: 'register',
    description: 'blacklist a guild or an user.',
    category: 'OWNER',
  },

  async execute(message, args, client) {
    try {
      const reply = await message.reply(
        '<a:reload:1158269773835141181> Started refreshing application (/) commands.',
      );

      await rest.put(
        // Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), // If you want the commands to be guild specific
        Routes.applicationCommands(client.user.id),
        { body: commands },
      );

      await reply.edit(
        `✅️ Started refreshing application (/) commands.\n✅️ Registered ${commands.length} commands`,
      );

      await reply.edit(
        `✅️ Started refreshing application (/) commands.\n✅️ Registered ${commands.length} commands\n✅️ Successfully reloaded application (/) commands.`,
      );
    } catch (error) {
      Logger.error(error);
    }
  },
};
