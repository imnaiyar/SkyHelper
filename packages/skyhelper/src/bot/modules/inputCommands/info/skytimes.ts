import { SKYTIMES_DATA } from "@/modules/commands-data/info-commands";
import Embeds from "@/utils/classes/Embeds";
import type { Command } from "@/structures";
import { MessageFlags } from "@discordjs/core";
export default {
  async interactionRun({ options, helper, t }) {
    await helper.defer({ flags: options.getBoolean("hide") ? MessageFlags.Ephemeral : undefined });

    await helper.editReply({ ...(await Embeds.getTimesEmbed(helper.client, t, t("common:bot.name"))) });
  },
  ...SKYTIMES_DATA,
} satisfies Command;
