import embeds from "@/utils/classes/Embeds";
import type { Button } from "@/structures";
import { checkQuestValidity } from "./sub/checkQuestValidation.js";

export default {
  data: {
    name: "daily-quests-scroll",
  },
  async execute(interaction, t, helper) {
    const client = helper.client;
    await helper.deferUpdate();
    const data = await client.schemas.getDailyQuests();
    console.log(data.last_updated);
    const isValid = checkQuestValidity(data.last_updated);
    if (!isValid) {
      await helper.editReply({ components: interaction.message.components });
      await helper.followUp({
        content: t("commands:DAILY_QUESTS.RESPONSES.OUTDATED"),
        flags: 64,
      });
      return;
    }
    const { index } = client.utils.parseCustomId(interaction.data.custom_id);
    const response = embeds.dailyQuestEmbed(data, parseInt(index));
    await helper.editReply(response);
  },
} satisfies Button;
