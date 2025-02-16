import type { ComponentStructure } from "@/structures";
import Embeds from "@/utils/classes/Embeds";

export default {
  data: {
    name: "shards-calendar",
  },
  async execute(interaction, t, helper) {
    // eslint-disable-next-line prefer-const
    const { month: m, year: y, type } = helper.client.utils.parseCustomId(interaction.data.custom_id);
    let index = 0;
    let month = parseInt(m);
    let year = parseInt(y);
    const value = parseInt(interaction.data.values[0]);
    switch (type) {
      case "month":
        month = value;
        break;
      case "year":
        year = value;
        break;
      case "index":
        index = value;
        break;
    }
    // @ts-expect-error eqeq
    await helper.update(Embeds.buildCalendarResponse(t, helper.client, helper.user.id, { index, month, year }));
  },
} satisfies ComponentStructure<"Select">;
