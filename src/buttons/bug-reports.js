import d from 'discord.js';

/**
 * @type {import(''@structures/Buttons)}
 */
export default {
  name: "error-report",
  
  async execute(interaction, client) {
    const modal = new d.ModalBuilder().setCustomId("errorModal").setTitle("Bug Report");

    const commandUsed = new d.TextInputBuilder()
      .setCustomId("commandUsed")
      .setLabel("Name of the command.")
      .setPlaceholder("The command that produced the said error.")
      .setStyle(d.TextInputStyle.Short);

    const whatHappened = new d.TextInputBuilder()
      .setCustomId("whatHappened")
      .setLabel("Explain what happened?")
      .setStyle(d.TextInputStyle.Paragraph)
      .setPlaceholder("Explain in brief what happened. What outcome were you hoping?");

    const firstActionRow = new d.ActionRowBuilder().addComponents(commandUsed);
    const secondActionRow = new d.ActionRowBuilder().addComponents(whatHappened);

    modal.addComponents(firstActionRow, secondActionRow);

    await interaction.showModal(modal);
  },
};
