import { getTimesEmbed } from "@/utils/classes/Embeds";
import type { Button } from "@/structures";
import { MessageFlags } from "@discordjs/core";

export default {
  data: {
    name: "times-refresh",
  },
  async execute(_interaction, t, helper) {
    await helper.deferUpdate();
    // TODO: setting embeds empty for the messages using legacy embeds, remove after considerable time
    await helper.editReply({ embeds: [], ...(await getTimesEmbed(helper.client, t)), flags: MessageFlags.IsComponentsV2 });
  },
} satisfies Button;
