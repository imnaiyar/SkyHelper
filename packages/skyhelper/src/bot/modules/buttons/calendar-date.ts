import { defineButton } from "@/structures";
import { CustomId } from "@/utils/customId-store";
import { ComponentType, TextInputStyle, type APIModalInteractionResponseCallbackData } from "@discordjs/core";
import { CalendarMonths } from "@/utils/constants";

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
          type: ComponentType.Label,
          label: _t("commands:SHARDS_CALENDAR.RESPONSES.MODAL_MONTH"),
          component: {
            type: ComponentType.SelectMenu,
            custom_id: "month",
            placeholder: _t("commands:SHARDS_CALENDAR.RESPONSES.MODAL_MONTH"),
            options: CalendarMonths.map((m, i) => ({
              label: m,
              value: String(i + 1),
              default: i + 1 === month,
            })),
            required: true,
          },
        },
        {
          type: ComponentType.Label,
          label: _t("commands:SHARDS_CALENDAR.RESPONSES.MODAL_YEAR"),
          description: "Max Input: `275760`",
          component: {
            type: ComponentType.TextInput,
            custom_id: "year",
            placeholder: _t("commands:SHARDS_CALENDAR.RESPONSES.MODAL_YEAR"),
            value: `${year}`,
            max_length: 6,
            style: TextInputStyle.Short,
            required: true,
          },
        },
      ],
    };
    await helper.launchModal(modal);
  },
});
