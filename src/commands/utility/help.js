const { ApplicationCommandOptionType } = require("discord.js");
const { helpMenu } = require("./sub/help");
module.exports = {
  data: {
    name: "help",
    description: "help menu",
    longDesc: "List of all Slash and Prefix commands and their usage.",
    integration_types: [0, 1],
    contexts: [0, 1, 2], 
  },
  async execute(interaction, client) {
    await helpMenu(interaction, client);
  },
};
