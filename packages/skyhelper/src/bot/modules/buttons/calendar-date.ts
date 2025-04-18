import type { Button } from "@/structures";
import { ComponentType, TextInputStyle, type APIModalInteractionResponseCallbackData } from "@discordjs/core";

export default {
  data: {
    name: "shards-calendar-date-update",
  },
  async execute(_interaction, _t, helper) {
    const { month, year } = helper.client.utils.parseCustomId(_interaction.data.custom_id);
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
              value: `${month.length < 2 ? `0${month}` : month}-${year}`,
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
} satisfies Button;
