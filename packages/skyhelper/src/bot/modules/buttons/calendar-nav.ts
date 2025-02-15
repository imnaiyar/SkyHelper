import type { ComponentStructure } from "@/structures";
import Embeds from "@/utils/classes/Embeds";

export default {
  data: {
    name: "calendar-nav",
  },
  async execute(interaction, t, helper) {
    const { index, month, year } = helper.client.utils.parseCustomId(interaction.data.custom_id);
    await helper.update(
      // @ts-expect-error eqeq
      Embeds.buildCalendarResponse(t, helper.client, helper.user.id, {
        index: parseInt(index),
        month: parseInt(month),
        year: parseInt(year),
      }),
    );
  },
} satisfies ComponentStructure<"Button">;
