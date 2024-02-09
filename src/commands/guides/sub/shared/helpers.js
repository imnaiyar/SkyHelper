const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
module.exports =  {
  rowBuilder: (customId, choices, placeholder, back) => {
    if (back) choices.push({
      label: "Back",
      value: "back",
      emoji: "⬅️",
    })
    return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .addOptions(choices));
  },

  respond: async (int, answers, value, ephemeral) => {
    await int.deferReply({ ephemeral: ephemeral })  
    const response = answers.getResponse(value)
    if (!response) {
      return int.followUp("Guide is still under development. Thank you for your patience")
    }
    await int.followUp(response)
    return;
  }
}
  
