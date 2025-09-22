import { defineButton } from "@/structures";
import { checkQuestValidity, checkQuestButtonValidToday } from "./sub/checkQuestValidation.js";
import { MessageFlags } from "@discordjs/core";
import { container, mediaGallery, mediaGalleryItem, separator, textDisplay } from "@skyhelperbot/utils";
import { CustomId } from "@/utils/customId-store";
export default defineButton({
  data: {
    name: "quest_video",
  },
  id: CustomId.QuestVideo,
  async execute(_interaction, t, helper, { index, date }) {
    const client = helper.client;
    await helper.defer({ flags: 64 });
    const data = await client.schemas.getDailyQuests();
    const d = data.quests[index];
    if (!d) return void (await helper.editReply({ content: "No data found for this quest." }));
    const isValid = checkQuestValidity(d.date);
    if (!isValid || !checkQuestButtonValidToday(date)) {
      return void (await helper.editReply({ content: t("commands:DAILY_QUESTS.RESPONSES.OUTDATED") }));
    }
    let quest_title = d.title;
    if (d.images?.[0]?.source) quest_title = `[${quest_title}](${d.images[0].source})`;
    const comp = container(
      textDisplay(`### ${quest_title}\n-# © ${d.images?.[0]?.by ?? "Unknown"}`),
      separator(),
      mediaGallery(mediaGalleryItem(d.images![0]!.url, { spoiler: true, description: d.title })),
    );

    await helper.editReply({ components: [comp], flags: MessageFlags.IsComponentsV2 });
  },
});
