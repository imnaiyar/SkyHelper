import type { Command } from "@/structures";
import { SHARDS_CALENDAR_DATA } from "@/modules/commands-data/info-commands";
import { buildCalendarResponse } from "@/utils/classes/Embeds";
import { MessageFlags } from "@discordjs/core";
export default {
  async interactionRun({ t, helper, options }) {
    const hide = options.getBoolean("hide") || false;
    await helper.reply({
      ...buildCalendarResponse(t, helper.client, helper.user.id),
      flags: MessageFlags.IsComponentsV2 | (hide ? MessageFlags.Ephemeral : 0),
    });
  },
  ...SHARDS_CALENDAR_DATA,
} satisfies Command;
