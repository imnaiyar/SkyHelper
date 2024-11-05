import type { Button } from "#structures";
import { EmbedBuilder } from "discord.js";
import { checkQuestValidity } from "./sub/checkQuestValidit.js";

export default {
  data: {
    name: "daily-quests-candles",
  },
  async execute(interaction, t, client) {
    await interaction.deferReply({ ephemeral: true });
    const data = await client.database.getDailyQuests();
    const type = interaction.customId.split("_")[1];
    const d = type === "rotating" ? data.rotating_candles : data.seasonal_candles;
    const title = type === "rotating" ? "Rotating Candles Location" : "Seasonal Candles Location";
    if (!d) return void (await interaction.editReply("No data found for this type of candles."));
    const isValid = checkQuestValidity(d.date);
    if (!isValid) {
      return void (await interaction.editReply(t("commands:DAILY_QUESTS.RESPONSES.OUTDATED")));
    }
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(d.title + `\n\nBy: ${d.images[0].by}`)
      .setImage(d.images[0].url);
    await interaction.editReply({ embeds: [embed] });
  },
} satisfies Button;
