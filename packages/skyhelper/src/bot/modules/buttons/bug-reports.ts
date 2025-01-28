import type { Button } from "@/structures";
import type { APIModalInteractionResponseCallbackData } from "@discordjs/core";

/**
 * @type {import(''@structures/Buttons)}
 */
export default {
  data: { name: "error-report" },
  async execute(interaction, t, helper) {
    const modal: APIModalInteractionResponseCallbackData = {
      custom_id: "errorModal",
      title: t("errors:ERROR_MODAL.TITLE"),
      components: [
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "commandUsed",
              label: t("errors:ERROR_MODAL.FIELDS.COMMAN_USED.LABEL"),
              placeholder: t("errors:ERROR_MODAL.FIELDS.COMMAN_USED.PLACEHOLDER"),
              style: 1,
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "whatHappened",
              label: t("errors:ERROR_MODAL.FIELDS.WHAT_HAPPENED.LABEL"),
              style: 2,
              placeholder: t("errors:ERROR_MODAL.FIELDS.WHAT_HAPPENED.PLACEHOLDER"),
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "errorId",
              label: t("errors:ERROR_MODAL.FIELDS.ERROR_ID.LABEL"),
              style: 1,
              value: helper.client.utils.parseCustomId(interaction.data.custom_id).error,
            },
          ],
        },
      ],
    };

    await helper.launchModal(modal);
  },
} satisfies Button;
