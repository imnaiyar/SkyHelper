import type { Button } from "@/structures";
import { checkQuestValidity, checkQuestButtonValidToday } from "./sub/checkQuestValidation.js";
import { MessageFlags } from "@discordjs/core";
import { DateTime } from "luxon";
import { container, mediaGallery, mediaGalleryItem, separator, textDisplay } from "@skyhelperbot/utils";
import { emojis } from "@skyhelperbot/constants";
export default {
  data: {
    name: "quest_video",
  },
  async execute(interaction, t, helper) {
    const client = helper.client;
    await helper.defer({ flags: 64 });
    const data = await client.schemas.getDailyQuests();
    const { index, date } = client.utils.parseCustomId(interaction.data.custom_id);
    const d = data.quests[parseInt(index)];
    if (!d) return void (await helper.editReply({ content: "No data found for this quest." }));
    const isValid = checkQuestValidity(d.date);
    if (!isValid || !checkQuestButtonValidToday(date)) {
      return void (await helper.editReply({ content: t("commands:DAILY_QUESTS.RESPONSES.OUTDATED") }));
    }
    let quest_title = `${d.title}`;
    if (d.images?.[0].source) quest_title = `[${quest_title}](${d.images?.[0].source})`;
    const comp = container(
      textDisplay(`### ${quest_title}\n-# © ${d.images?.[0].by || "Unknown"}`),
      separator(),
      mediaGallery(mediaGalleryItem(d.images[0].url, { spoiler: true, description: d.title })),
    );

    await helper.editReply({ components: [comp], flags: MessageFlags.IsComponentsV2 });
  },
} satisfies Button;
