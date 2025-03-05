import type { Button } from "@/structures";
import { buildCalendarResponse } from "@/utils/classes/Embeds";
import { MessageFlags } from "@discordjs/core";

export default {
  data: {
    name: "calendar-nav",
  },
  async execute(interaction, t, helper) {
    const { index, month, year } = helper.client.utils.parseCustomId(interaction.data.custom_id);
    await helper.update({
      ...buildCalendarResponse(t, helper.client, helper.user.id, {
        index: parseInt(index),
        month: parseInt(month),
        year: parseInt(year),
      }),
      flags: MessageFlags.IsComponentsV2,
    });
  },
} satisfies Button;
