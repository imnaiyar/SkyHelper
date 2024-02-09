const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");

module.exports = {
  /**
   * Returns StringSelect Menu ActionRow for guides
   * @param {string} customId - The custom Id for the select menu
   * @param {object} choices - The options to include in select menu
   * @param {string} placeholder - Placeholder for the select menu
   * @param {Boolean} back - Whether to include back option or not
   */
  rowBuilder: (customId, choices, placeholder, back) => {
    if (back)
      choices.push({
        label: "Back",
        value: "back",
        emoji: "⬅️",
      });
    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId(customId).setPlaceholder(placeholder).addOptions(choices)
    );
  },

  /**
   * Responds with the chosen guide
   * @param {import('discord.js').Interaction} int - The SelectMenu Interaction
   * @param {object} answers - The guides to search from
   * @param {string} value - the value to search for
   * @param {Boolean} ephemeral - Whether reply should be ephemeral
   */
  respond: async (int, answers, value, ephemeral) => {
    await int.deferReply({ ephemeral: ephemeral });
    const response = answers.getResponse(value);
    if (!response) {
      return int.followUp("Guide is still under development. Thank you for your patience");
    }
    await int.followUp(response);
    return;
  },
};
