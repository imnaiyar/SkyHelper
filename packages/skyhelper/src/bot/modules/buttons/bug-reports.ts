import { defineButton } from "@/structures";
import { CustomId } from "@/utils/customId-store";
import type { APIModalInteractionResponseCallbackData } from "@discordjs/core";

export default defineButton({
  data: { name: "error-report" },
  id: CustomId.BugReports,
  async execute(_interaction, t, helper, { error }) {
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
              value: error,
            },
          ],
        },
      ],
    };

    await helper.launchModal(modal);
  },
});
