import type { DailyQuestsSchema } from "#schemas/dailyQuests";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import moment from "moment-timezone";

export const dailyQuestEmbed = (data: DailyQuestsSchema, index: number) => {
  const { quests, rotating_candles } = data;
  const total = quests.length;
  const quest = quests[index];
  let desc = `${quest.images[0]?.by ? `© ${quest.images[0].by}` : ""}\n${quest.images[0]?.source ? `Source: ${quest.images[0].source}` : ""}`;
  const embed = new EmbedBuilder()
    .setAuthor({
      name: `Daily Quests (${index + 1}/${total})`,
      iconURL: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/72/Quest-icon.png",
    })
    .setTitle(quest.title)
    .setFooter({ text: `Page ${index + 1}/${total}` });
  if (quest.images.length) {
    const ext = quest.images[0].url.split("?")[0].split(".").pop();
    if (ext && ["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv"].includes(ext)) {
      desc += `\n**Video Guide**:  [Link](${quest.images[0].url})`;
    } else {
      embed.setImage(quest.images[0].url);
    }
  }

  embed.setDescription(desc);

  const selectMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder().setCustomId("daily_quests_select").addOptions(
      quests.map((q, i) => ({
        label: q.title.slice(0, 50),
        value: i.toString(),
        default: i === index,
      })),
    ),
  );
  const disabledSe =
    data.seasonal_candles &&
    moment()
      .tz("America/Los_Angeles")
      .startOf("day")
      .isSame(moment.tz(data.seasonal_candles.date, "America/Los_Angeles").startOf("day"))
      ? false
      : true;

  const nextBtn = new ButtonBuilder()
    .setCustomId("daily-quests-next_" + (index + 1))
    .setLabel(index === total - 1 ? `Quest ${total}` : `Quest ${index + 2}` + " ▶️")
    .setDisabled(index === total - 1)
    .setStyle(ButtonStyle.Primary);
  const prevBtn = new ButtonBuilder()
    .setCustomId("daily-quests-prev_" + (index - 1))
    .setLabel("◀️ " + (index === 0 ? `Quest 1` : `Quest ${index}`))
    .setDisabled(index === 0)
    .setStyle(ButtonStyle.Primary);
  const rotatingBtn = new ButtonBuilder()
    .setCustomId("daily-quests-candles_rotating")
    .setLabel("Rotating Candles")
    .setStyle(ButtonStyle.Success);
  const seasonalBtn = new ButtonBuilder()
    .setCustomId("daily-quests-candles_seasonal")
    .setLabel("Seasonal Candles")
    .setDisabled(disabledSe)
    .setStyle(ButtonStyle.Success);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(prevBtn, nextBtn, rotatingBtn);
  if (rotating_candles) row.addComponents(seasonalBtn);
  return { embeds: [embed], components: [selectMenu, row] };
};
