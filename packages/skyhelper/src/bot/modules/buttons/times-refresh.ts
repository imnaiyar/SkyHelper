import embed from "@/utils/classes/Embeds";
import type { Button } from "@/structures";

export default {
  data: {
    name: "times-refresh",
  },
  async execute(_interaction, t, helper) {
    await helper.deferUpdate();
    await helper.editReply(await embed.getTimesEmbed(helper.client, t));
  },
} satisfies Button;
