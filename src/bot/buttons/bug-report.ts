import type { Button } from "#structures";

import * as d from "discord.js";

/**
 * @type {import(''@structures/Buttons)}
 */
export default {
  data: { name: "error-report" },
  async execute(interaction) {
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
    const errorId = new d.TextInputBuilder()
      .setCustomId("errorId")
      .setLabel("Error ID")
      .setStyle(d.TextInputStyle.Short)
      .setValue(interaction.customId.split("error-report_")[1]);

    const firstActionRow = new d.ActionRowBuilder<d.TextInputBuilder>().addComponents(commandUsed);
    const secondActionRow = new d.ActionRowBuilder<d.TextInputBuilder>().addComponents(whatHappened);
    const thirdActionRow = new d.ActionRowBuilder<d.TextInputBuilder>().addComponents(errorId);

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

    await interaction.showModal(modal);
  },
} satisfies Button;
