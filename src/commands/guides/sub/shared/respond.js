const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");

module.exports = async (interaction, selectedChoice, currentChoices, nextChoices, messageChoices, CUSTOM_ID, ephemeral, choiceResponses) => {
    const messageChoice = messageChoices.get(interaction.message.id);
    const value = selectedChoice === CUSTOM_ID.BACK ? messageChoice.firstChoice : selectedChoice;
  
  
    if (!nextChoices || !nextChoices[value]) {
      const response = choiceResponses.getResponse(messageChoices);
      await respondToInteraction(interaction, response, ephemeral);
      return;
    }
  
    const options = nextChoices[value].map((choice) => ({
      label: choice.label,
      value: choice.value,
      emoji: emojiMap[choice.label] || choice.emoji,
    }));
  
    options.push(backObj);
  
    const row = new ActionRowBuilder().addComponents(
      buildSelectMenu(getLabel(messageChoice, value), getNextCustomId(interaction.customId, CUSTOM_ID), options)
    );
  
    await interaction.update({
      content: `Guides for ___${getLabel(messageChoice, value)}___`,
      components: [row],
    });
  }
  
  function buildSelectMenu(placeholder, customId, options) {
    return new StringSelectMenuBuilder()
      .setCustomId(customId)
      .setPlaceholder(placeholder)
      .addOptions(options);
  }
  
  async function respondToInteraction(interaction, response, ephemeral) {
    if (!response) {
      await interaction.update("**Season of Revival** guides are still under development. Thank you for your patience.");
      return;
    }
  
    await interaction.deferReply({ ephemeral: ephemeral });
    await interaction.followUp(response);
  }
  
  function getLabel(choices, value) {
    return choices.label[choices.index]
  }
  
  function getNextCustomId(currentCustomId, CUSTOM_ID) {
    return currentCustomId === CUSTOM_ID.FIRST_CHOICE
      ? CUSTOM_ID.SECOND_CHOICE
      : currentCustomId === CUSTOM_ID.SECOND_CHOICE
      ? CUSTOM_ID.THIRD_CHOICE
      : "";
  }

  const backObj = {
    label: "Back",
    value: "back",
    emoji: "⬅️",
  };
  
  const emojiMap = {
    "Seasonal Quests": "<:quests:1131171487877963886>",
    "Spirit Locations": "<:location:1131173266883612722>",
    "Spirits Tree": "<:tree:1131279758907424870>",
    "Seasonal Price Tree": "<:tree:1131279758907424870>",
  };