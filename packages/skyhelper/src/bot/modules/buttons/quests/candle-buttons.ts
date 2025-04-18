import type { Button } from "@/structures";
import { checkQuestValidity, checkQuestButtonValidToday } from "./sub/checkQuestValidation.js";
import type { APIEmbed } from "@discordjs/core";
import { DateTime } from "luxon";
export default {
  data: {
    name: "daily-quests-candles",
  },
  async execute(interaction, t, helper) {
    const client = helper.client;
    await helper.defer({ flags: 64 });
    const data = await client.schemas.getDailyQuests();
    const { type, date } = client.utils.parseCustomId(interaction.data.custom_id);
    const d = type === "rotating" ? data.rotating_candles : data.seasonal_candles;
    const title = type === "rotating" ? "Rotating Candles Location" : "Seasonal Candles Location";
    if (!d) return void (await helper.editReply({ content: "No data found for this type of candles." }));
    const isValid = checkQuestValidity(d.date);
    if (!isValid || !checkQuestButtonValidToday(date)) {
      return void (await helper.editReply({ content: t("commands:DAILY_QUESTS.RESPONSES.OUTDATED") }));
    }
    const embed: APIEmbed = {
      title: title + `\n${DateTime.now().setZone("America/Los_Angeles").toFormat("dd-MM-yyyy")}`,
      description: `${d.title}\n\nBy: ${d.images[0].by}`,
      image: {
        url: d.images[0].url,
      },
    };
    await helper.editReply({ embeds: [embed] });
  },
} satisfies Button;
