import { dailyQuestEmbed } from "#handlers";
import { Button } from "#structures";

export default {
  data: {
    name: "daily-quests-next",
  },
  async execute(interaction, _t, client) {
    await interaction.deferUpdate();
    const data = await client.database.getDailyQuests();
    const index = parseInt(interaction.customId.split("_")[1]);
    const response = dailyQuestEmbed(data, index);
    await interaction.editReply(response);
  },
} satisfies Button;
