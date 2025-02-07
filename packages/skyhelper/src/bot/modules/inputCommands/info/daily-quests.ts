import embeds from "@/utils/classes/Embeds";
import type { Command, SkyHelper } from "@/structures";
import { DateTime } from "luxon";

import type { getTranslator } from "@/i18n";
import { DAILY_QUESTS_DATA } from "@/modules/commands-data/info-commands";
import { MessageFlags, type APIActionRowComponent, type APIMessage, type APIMessageActionRowComponent } from "@discordjs/core";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
export default {
  async interactionRun({ t, helper, options }) {
    throw new Error("hmm");

    await helper.defer({ flags: options.getBoolean("hide") ? MessageFlags.Ephemeral : undefined });

    const m = await helper.editReply(await getQuestResponse(helper.client, t));
    disableButtons(m, helper);
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
  return embeds.dailyQuestEmbed(data, 0);
};

const disableButtons = (message: APIMessage, helper: InteractionHelper): void => {
  const collector = helper.client.componentCollector({ message, idle: 90_000 });
  collector.on("end", () => {
    const actionRow: APIActionRowComponent<APIMessageActionRowComponent>[] = message.components!.map((row) => {
      const components = row.components.map((c) => ({
        ...c,
        disabled: true,
      }));

      return {
        type: 1,
        components,
      };
    });
    helper
      .editReply({
        components: actionRow,
      })
      .catch(() => {});
  });
};
