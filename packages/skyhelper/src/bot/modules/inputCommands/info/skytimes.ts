import { SKYTIMES_DATA } from "@/modules/commands-data/info-commands";
import { getTimesEmbed } from "@/utils/classes/Embeds";
import type { Command } from "@/structures";
import { MessageFlags } from "@discordjs/core";
export default {
  async interactionRun({ options, helper, t }) {
    const hide = options.getBoolean("hide") || false;
    await helper.defer({ flags: hide ? MessageFlags.Ephemeral : undefined });

    await helper.editReply({ ...(await getTimesEmbed(helper.client, t)), flags: MessageFlags.IsComponentsV2 });
  },
  ...SKYTIMES_DATA,
} satisfies Command;
