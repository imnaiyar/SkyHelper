import type { Command } from "@/structures";
import { SHARDS_CALENDAR_DATA } from "@/modules/commands-data/info-commands";
import Embeds from "@/utils/classes/Embeds";
import { MessageV2Flags } from "@/types/component-v2";
export default {
  async interactionRun({ t, helper }) {
    // TODO: REMOVE before merge
    // @ts-expect-error until next
    await helper.reply({
      ...Embeds.buildCalendarResponse(t, helper.client, helper.user.id),
      flags: 64 | MessageV2Flags.IS_COMPONENTS_V2,
    });
  },
  ...SHARDS_CALENDAR_DATA,
} satisfies Command;
