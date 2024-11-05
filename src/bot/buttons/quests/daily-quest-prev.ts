import { dailyQuestEmbed } from "#utils";
import type { Button } from "#structures";
import { checkQuestValidity } from "./sub/checkQuestValidit.js";

export default {
  data: {
    name: "daily-quests-prev",
  },
  async execute(interaction, t, client) {
    await interaction.deferUpdate();
    const data = await client.database.getDailyQuests();
    const index = parseInt(interaction.customId.split("_")[1]);
    const isValid = checkQuestValidity(data.last_updated);
    if (!isValid) {
      await interaction.editReply({ components: interaction.message.components });
      await interaction.followUp({
        content: t("commands:DAILY_QUESTS.RESPONSES.OUTDATED"),
        ephemeral: true,
      });
      return;
    }
    const response = dailyQuestEmbed(data, index);
    await interaction.editReply(response);
  },
} satisfies Button;
