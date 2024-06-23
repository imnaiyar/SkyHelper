import { DailyQuestsSchema } from "#schemas/dailyQuests";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";

export const dailyQuestEmbed = (data: DailyQuestsSchema, index: number) => {
  const { quests, rotating_candles } = data;
  const total = quests.length;
  const quest = quests[index];
  const embed = new EmbedBuilder()
    .setAuthor({
      name: `Daily Quests (${index}/${total})`,
      iconURL: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/72/Quest-icon.png",
    })
    .setTitle(quest.title)
    .setFooter({ text: `Page ${index + 1}/${total}` });
  if (quest.images.length) embed.setImage(quest.images[0].url);
  if (quest.description) embed.setDescription(quest.description);
  const selectMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder().setCustomId("daily_quests_select").addOptions(
      quests.map((q, i) => ({
        label: q.title.slice(0, 50),
        value: i.toString(),
        default: i === index,
      })),
    ),
  );
  const nextBtn = new ButtonBuilder()
    .setCustomId("daily-quests-next" + (index + 1))
    .setLabel((index === total - 1 ? quest.title.slice(0, 10) : quests[index + 1].title.slice(0, 10)) + " ▶️")
    .setDisabled(index === total - 1)
    .setStyle(ButtonStyle.Primary);
  const prevBtn = new ButtonBuilder()
    .setCustomId("daily-quests-prev" + (index - 1))
    .setLabel("◀️ " + (index === 0 ? quest.title.slice(0, 10) : quests[index - 1].title.slice(0, 10)))
    .setDisabled(index === 0)
    .setStyle(ButtonStyle.Primary);
  const rotatingBtn = new ButtonBuilder()
    .setCustomId("daily-quests-rotating")
    .setLabel("Rotating Candles")
    .setStyle(ButtonStyle.Success);
  const seasonalBtn = new ButtonBuilder()
    .setCustomId("daily-quests-seasonal")
    .setLabel("Seasonal Candles")
    .setStyle(ButtonStyle.Success);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(prevBtn, nextBtn, rotatingBtn);
  if (rotating_candles) row.addComponents(seasonalBtn);
  return { embeds: [embed], components: [selectMenu, row] };
};
