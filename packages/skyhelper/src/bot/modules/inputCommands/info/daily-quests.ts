import { dailyQuestEmbed } from "@/utils/classes/Embeds";
import type { Command, SkyHelper } from "@/structures";
import { DateTime } from "luxon";
import { textDisplay, separator } from "@skyhelperbot/utils";

import type { getTranslator } from "@/i18n";
import { DAILY_QUESTS_DATA } from "@/modules/commands-data/info-commands";
import { MessageFlags } from "@discordjs/core";
export default {
  async interactionRun({ t, helper, options }) {
    await helper.defer({ flags: options.getBoolean("hide") ? MessageFlags.Ephemeral : undefined });

    await helper.editReply(await getQuestResponse(helper.client, t));
  },
  ...DAILY_QUESTS_DATA,
} satisfies Command;

const getQuestResponse = async (client: SkyHelper, t: ReturnType<typeof getTranslator>) => {
  const data = await client.schemas.getDailyQuests();
  const now = DateTime.now().setZone(client.timezone).startOf("day");
  const lastUpdated = DateTime.fromISO(data.last_updated, { zone: client.timezone }).startOf("day");
  if (!data.last_updated || !now.equals(lastUpdated) || !data.quests.length) {
    return {
      components: [
        textDisplay(t("commands:DAILY_QUESTS.RESPONSES.NO_DATA")),
        separator(true, 1),
        textDisplay("-# " + t("commands:DAILY_QUESTS.RESPONSES.TIME_FRAME")),
      ],
      flags: MessageFlags.IsComponentsV2,
    };
  }
  return { ...dailyQuestEmbed(data, t), flags: MessageFlags.IsComponentsV2 };
};
