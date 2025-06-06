import { getTimesEmbed } from "@/utils/classes/Embeds";
import { defineButton } from "@/structures";
import { MessageFlags } from "@discordjs/core";
import { CustomId } from "@/utils/customId-store";

export default defineButton({
  data: {
    name: "times-refresh",
  },
  id: CustomId.TimesRefresh,
  async execute(_interaction, t, helper) {
    await helper.deferUpdate();
    // TODO: setting embeds empty for the messages using legacy embeds, remove after considerable time
    await helper.editReply({ embeds: [], ...(await getTimesEmbed(helper.client, t)), flags: MessageFlags.IsComponentsV2 });
  },
});
