import { dailyQuestEmbed } from "@/utils/classes/Embeds";
import type { Command, SkyHelper } from "@/structures";
import { DateTime } from "luxon";

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
    return { content: t("commands:DAILY_QUESTS.RESPONSES.NO_DATA") };
  }
  return { ...dailyQuestEmbed(data), flags: MessageFlags.IsComponentsV2 };
};
