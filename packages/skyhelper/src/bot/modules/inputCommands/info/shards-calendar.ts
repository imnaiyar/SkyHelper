import type { Command } from "@/structures";
import { SHARDS_CALENDAR_DATA } from "@/modules/commands-data/info-commands";
import { buildCalendarResponse } from "@/utils/classes/Embeds";
import { MessageFlags } from "@discordjs/core";
export default {
  async interactionRun({ t, helper, options }) {
    const hide = options.getBoolean("hide") ?? false;
    await helper.defer({ flags: hide ? MessageFlags.Ephemeral : undefined });

    const response = await buildCalendarResponse(t, helper.user.id);

    await helper.editReply({
      ...response,
      flags: MessageFlags.IsComponentsV2,
    });
  },
  ...SHARDS_CALENDAR_DATA,
} satisfies Command;
