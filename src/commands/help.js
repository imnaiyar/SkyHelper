const { ApplicationCommandOptionType } = require("discord.js");
const {helpMenu} = require('@handler/help')
module.exports = {
    data: {
      name: 'help',
      description: 'Get the List of Slash and Prefix commands.',
    },
    async execute(interaction, client) {
      await helpMenu(interaction,client);
    },
  };
  