import type { Button } from "#structures";

import * as d from "discord.js";

/**
 * @type {import(''@structures/Buttons)}
 */
export default {
  data: { name: "error-report" },
  async execute(interaction, t) {
    const modal = new d.ModalBuilder().setCustomId("errorModal").setTitle(t("errors:ERROR_MODAL.TITLE"));

    const commandUsed = new d.TextInputBuilder()
      .setCustomId("commandUsed")
      .setLabel(t("errors:ERROR_MODAL.FIELDS.COMMAN_USED.LABEL"))
      .setPlaceholder(t("errors:ERROR_MODAL.FIELDS.COMMAN_USED.PLACEHOLDER"))
      .setStyle(d.TextInputStyle.Short);

    const whatHappened = new d.TextInputBuilder()
      .setCustomId("whatHappened")
      .setLabel(t("errors:ERROR_MODAL.FIELDS.WHAT_HAPPENED.LABEL"))
      .setStyle(d.TextInputStyle.Paragraph)
      .setPlaceholder(t("errors:ERROR_MODAL.FIELDS.WHAT_HAPPENED.PLACEHOLDER"));
    const errorId = new d.TextInputBuilder()
      .setCustomId("errorId")
      .setLabel(t("errors:ERROR_MODAL.FIELDS.ERROR_ID.LABEL"))
      .setStyle(d.TextInputStyle.Short)
      .setValue(interaction.customId.split("error-report_")[1]);

    const firstActionRow = new d.ActionRowBuilder<d.TextInputBuilder>().addComponents(commandUsed);
    const secondActionRow = new d.ActionRowBuilder<d.TextInputBuilder>().addComponents(whatHappened);
    const thirdActionRow = new d.ActionRowBuilder<d.TextInputBuilder>().addComponents(errorId);

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

    await interaction.showModal(modal);
  },
} satisfies Button;
