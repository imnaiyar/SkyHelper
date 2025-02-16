import type { Command } from "@/structures";

export default {
  name: "uikit",
  description: "UI Kit",
  data: {
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  ownerOnly: true,
  category: "Owner",
  async interactionRun({ helper }) {
    await helper.defer({ flags: 64 });
    const quests = await helper.client.schemas.getDailyQuests();
    const component = {
      type: 17,
      components: [],
    };
    for (const quest of quests.quests) {
      let content = "### " + quest.title || "Title Error";
      if (quest.description) content += `\n${quest.description}`;
      if (quest.images[0]?.by) content += `\n\nBy: ${quest.images[0].by}`;
      if (quest.images[0]?.source) content += `\nSource: ${quest.images[0].source}`;
      const ext = quest.images[0]?.url.split("?")[0].split(".").pop();
      if (ext && ["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv"].includes(ext)) {
        content += `\n**Video Guide**:  [Link](${quest.images[0].url})`;
      }
      const textComponent = {
        type: 10,
        content,
      };
      if (quest.images[0]?.url) {
        component.components.push(
          // @ts-expect-error
          {
            type: 9,
            components: [textComponent],
            accessory: {
              type: 11,
              media: { url: quest.images[0].url },
              description: quest.description || "None",
              spoiler: true,
            },
          },
          { type: 14, divider: true, spacing: 2 },
        );
      }
    }

    let text = "### Rotating Candles/Seasonal Candles\n";
    text += `\`Rotating Candles:\` ${quests.rotating_candles.images[0].source ? `[Source](${quests.rotating_candles.images[0].source}) | ` : ""}BY: ${quests.rotating_candles.images[0].by}\n`;
    if (quests.seasonal_candles) {
      text += `\`Seasonal Candles:\` ${quests.seasonal_candles.images[0].source ? `[Source](${quests.rotating_candles.images[0].source}) | ` : ""}BY: ${quests.seasonal_candles.images[0].by}`;
    }
    const items = [
      { media: { url: quests.rotating_candles.images[0].url }, spoiler: true, description: quests.rotating_candles.images[0].by },
    ];
    if (quests.seasonal_candles) {
      items.push({
        media: { url: quests.seasonal_candles.images[0].url },
        spoiler: true,
        description: quests.seasonal_candles.images[0].by,
      });
    }

    component.components.push(
      // @ts-expect-error
      {
        type: 10,
        content: text,
      },
      {
        type: 12,
        items,
      },
    );

    // @ts-expect-error
    await helper.editReply({ flags: 32768, components: [component] });
  },
} satisfies Command;
