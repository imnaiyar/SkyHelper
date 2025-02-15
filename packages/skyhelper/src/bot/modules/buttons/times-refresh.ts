import embed from "@/utils/classes/Embeds";
import type { ComponentStructure } from "@/structures";

export default {
  data: {
    name: "times-refresh",
  },
  async execute(_interaction, t, helper) {
    await helper.deferUpdate();
    // TODO: remove before merge
    // @ts-expect-error
    await helper.editReply(await embed.getTimesEmbed(helper.client, t));
  },
} satisfies ComponentStructure<"Button">;
