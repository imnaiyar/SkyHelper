import type { ComponentStructure } from "@/structures";
import Embeds from "@/utils/classes/Embeds";
import Utils from "@/utils/classes/Utils";
import { DateTime } from "luxon";

export default {
  data: {
    name: "daily_quests_select",
  },
  async execute(interaction, t, helper) {
    const { date } = Utils.parseCustomId(interaction.data.custom_id);
    const [day, month, year] = date.split("-").map(Number);

    const isValid = DateTime.now()
      .setZone("America/Los_Angeles")
      .hasSame(DateTime.fromObject({ day, month, year }, { zone: "America/Los_Angeles" }), "day");
    if (!isValid) {
      await helper.reply({
        content: t("commands:DAILY_QUESTS.RESPONSES.OUTDATED"),
        flags: 64,
      });
      return;
    }
    await helper.deferUpdate();
    const index = parseInt(interaction.data.values[0]);
    const data = await helper.client.schemas.getDailyQuests();
    const response = Embeds.dailyQuestEmbed(data, index);
    await helper.editReply({
      ...response,
    });
  },
} satisfies ComponentStructure<"Select">;
