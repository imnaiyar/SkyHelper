import { ApplicationCommandOptionType } from 'discord.js';
import { helpMenu } from './sub/help';

export default {
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
