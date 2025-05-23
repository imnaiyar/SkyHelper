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
        textDisplay("No data found for today's daily quests. Please try again later."),
        separator(true, 1),
        textDisplay(
          "-# Please note that it can take upto 30min-1hrs after daily resets for quests to be updated. The time frame given is just an estimate, on somedays, it can take longer than that. See how it works [here](<https://docs.skyhelper.xyz/commands/info#how-does-this-work>)",
        ),
      ],
      flags: MessageFlags.IsComponentsV2,
    };
  }
  return { ...dailyQuestEmbed(data), flags: MessageFlags.IsComponentsV2 };
};
