const { REST } = require('@discordjs/rest');
const fs = require('fs');
const path = require('path');
const { Routes } = require('discord-api-types/v9');
const Logger = require('@src/logger');
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

const commandDirectory = path.join(__dirname, '../');
const commands = [];

// Function to recursively search for command files
function findCommandFiles(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory()) {
      // If it's a directory and not named "sub," recursively search it
      if (file !== 'sub' && file !== 'prefix') {
        findCommandFiles(filePath);
      }
    } else if (file.endsWith('.js') && !file.startsWith('skyEvents')) {
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
        // Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), // For guild commands
        Routes.applicationCommands(client.user.id),
        { body: commands },
      );

      await reply.edit(
        `✅️ Started refreshing application (/) commands.\n✅️ Registered ${commands.length} commands`,
      );
    } catch (error) {
      Logger.error(error);
    }
  },
};
