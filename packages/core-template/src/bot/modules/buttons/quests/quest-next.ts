import embeds from "@/utils/classes/Embeds";
import type { Button } from "@/structures";
import { checkQuestValidity } from "./sub/checkQuestValidation.js";

export default {
  data: {
    name: "daily-quests-next",
  },
  async execute(interaction, t, helper) {
    const client = helper.client;
    await helper.deferUpdate();
    const data = await client.schemas.getDailyQuests();
    const isValid = checkQuestValidity(data.last_updated);
    if (!isValid) {
      await helper.editReply({ components: interaction.message.components });
      await helper.followUp({
        content: t("commands:DAILY_QUESTS.RESPONSES.OUTDATED"),
        flags: 64,
      });
      return;
    }
    const id = client.utils.parseCustomId(interaction.data.custom_id).id;
    const index = parseInt(id.split("_")[1]);
    const response = embeds.dailyQuestEmbed(data, index);
    await helper.editReply(response);
  },
} satisfies Button;
