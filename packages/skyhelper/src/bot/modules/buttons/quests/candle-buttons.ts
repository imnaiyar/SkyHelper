import { defineButton } from "@/structures";
import { checkQuestValidity, checkQuestButtonValidToday } from "./sub/checkQuestValidation.js";
import { MessageFlags } from "@discordjs/core";
import { DateTime } from "luxon";
import { container, mediaGallery, mediaGalleryItem, separator, textDisplay } from "@skyhelperbot/utils";
import { emojis } from "@skyhelperbot/constants";
import { CustomId } from "@/utils/customId-store";
export default defineButton({
  data: {
    name: "daily-quests-candles",
  },
  id: CustomId.CandleButton,
  async execute(_interaction, t, helper, { date, type }) {
    const client = helper.client;
    await helper.defer({ flags: 64 });
    const data = await client.schemas.getDailyQuests();
    const d = type === "rotating" ? data.rotating_candles : data.seasonal_candles;
    const title = type === "rotating" ? "Rotating Candles Location" : "Seasonal Candles Location";
    if (!d) return void (await helper.editReply({ content: "No data found for this type of candles." }));
    const isValid = checkQuestValidity(d.date);
    if (!isValid || !checkQuestButtonValidToday(date)) {
      return void (await helper.editReply({ content: t("commands:DAILY_QUESTS.RESPONSES.OUTDATED") }));
    }
    const comp = container(
      textDisplay(
        `### ${title}\n${DateTime.now().setZone("America/Los_Angeles").toFormat("dd-MM-yyyy")}` +
          `\n${emojis.tree_middle}By: ${d.images[0].by}\n${emojis.tree_end}Source: ${d.images[0].source ?? "Unknown"}`,
      ),
      separator(),
      mediaGallery(mediaGalleryItem(d.images[0].url, { spoiler: true, description: d.title })),
    );

    await helper.editReply({ components: [comp], flags: MessageFlags.IsComponentsV2 });
  },
});
