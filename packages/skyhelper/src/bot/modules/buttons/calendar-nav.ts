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
    await helper.deferUpdate();

    const response = await buildCalendarResponse(
      t,
      helper.user.id,
      {
        index: index,
        month: month,
        year: year,
      },
      true,
    );

    await helper.editReply({
      ...response,
      flags: MessageFlags.IsComponentsV2,
    });
  },
});
