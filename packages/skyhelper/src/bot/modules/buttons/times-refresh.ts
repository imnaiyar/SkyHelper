import { getTimesEmbed } from "@/utils/classes/Embeds";
import type { Button } from "@/structures";
import { MessageFlags } from "@discordjs/core";

export default {
  data: {
    name: "times-refresh",
  },
  async execute(_interaction, t, helper) {
    await helper.deferUpdate();
    await helper.editReply({ ...(await getTimesEmbed(helper.client, t)), flags: MessageFlags.IsComponentsV2 });
  },
} satisfies Button;
