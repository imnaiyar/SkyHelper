import { defineButton } from "@/structures";
import { buildCalendarResponse } from "@/utils/classes/Embeds";
import { CustomId } from "@/utils/customId-store";
import { MessageFlags } from "@discordjs/core";

export default defineButton({
  data: {
    name: "calendar-nav",
  },
  id: CustomId.CalenderNav,
  async execute(_interaction, t, helper, { index, month, year }) {
    await helper.update({
      ...buildCalendarResponse(t, helper.client, helper.user.id, {
        index: index,
        month: month,
        year: year,
      }),
      flags: MessageFlags.IsComponentsV2,
    });
  },
});
