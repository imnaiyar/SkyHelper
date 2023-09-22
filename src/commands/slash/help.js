const { ApplicationCommandOptionType } = require("discord.js");
const {helpMenu} = require('@handler/functions/help')
module.exports = {
    data: {
      name: 'help',
      description: 'help menu',
      longDesc: 'List of all Slash and Prefix commands and their usage.',
      options: [
        { 
          name: 'command',
          description: 'get help for a specific command',
          type: ApplicationCommandOptionType.String,
          require: false
        },
        ],
    },
    async execute(interaction, client) {
      await helpMenu(interaction,client);
    },
  };
  