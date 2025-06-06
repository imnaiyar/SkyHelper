import { defineButton } from "@/structures";
import { CustomId } from "@/utils/customId-store";
import { ComponentType, TextInputStyle, type APIModalInteractionResponseCallbackData } from "@discordjs/core";

export default defineButton({
  data: {
    name: "shards-calendar-date-update",
  },
  id: CustomId.CalendarDate,
  async execute(_interaction, _t, helper, { month, year }) {
    const modal: APIModalInteractionResponseCallbackData = {
      title: "Change Date/Month",
      custom_id: "shards-calendar-modal-date",
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.TextInput,
              custom_id: "date-month",
              placeholder: "Enter month and year in this format: MM-YYYY (e.g. 01-2022)",
              value: `${month < 10 ? `0${month}` : month}-${year}`,
              label: "Enter Month/Year (Format: MM-YYYY)",
              required: true,
              max_length: 7,
              style: TextInputStyle.Short,
            },
          ],
        },
      ],
    };
    await helper.launchModal(modal);
  },
});
