import { seasonsData } from "#libs";
import type { SeasonData } from "#libs/constants/seasonsData";
import * as discordJs from "discord.js";
import { handleSpirits } from "./handleSpirits.js";
import moment from "moment";

export async function handleSeasional(interaction: discordJs.ChatInputCommandInteraction) {
  const value = interaction.options.getString("season")!;
  const type = interaction.options.getString("type")!;
  const season = seasonsData[value as keyof typeof seasonsData];
  switch (type) {
    case "quest": {
      await handleQuests(interaction, season);
      break;
    }
    case "spirits": {
      await handleSpirits(interaction, season);
      break;
    }
  }
}

async function handleQuests(int: discordJs.ChatInputCommandInteraction, season: SeasonData) {
  const quests = season.quests;
  const now = moment().tz(int.client.timezone).startOf("day");
  const start = moment.tz(season.from[0], "DD-MM-YYYY", int.client.timezone).startOf("day");
  const end = moment.tz(season.from[1], "DD-MM-YYYY", int.client.timezone).endOf("day");
  const isActive = now.isSameOrAfter(start) && now.isSameOrBefore(end);

  const t = await int.t();
  if (!quests?.length) {
    return void int.editReply({ content: t("commands.GUIDES.RESPONSES.NO_QUEST", { SEASON: `${season.icon} ${season.name}` }) });
  }
  const total = quests.length;
  let page = 1;
  const getResponse = () => {
    const quest = quests[page - 1];
    const emojiUrl = int.client.emojis.cache.get(discordJs.parseEmoji(season.icon)!.id!)?.imageURL();
    const embed = new discordJs.EmbedBuilder()
      .setAuthor({ name: t("commands.GUIDES.RESPONSES.QUEST_EMBED_AUTHOR", { SEASON: season.name }), iconURL: emojiUrl })
      .setTitle(`${season.icon} ${quest.title}`)
      .setURL(`https://sky-children-of-the-light.fandom.com/wiki/Season_of_${season.name}#${quest.title.split(" ").join("_")}`)
      .setFooter({ text: "SkyHelper", iconURL: int.client.user.displayAvatarURL() });
    if (quest.description) {
      embed.setDescription(
        (isActive
          ? `Season is currently active.\n- **Start Date**: ${discordJs.time(start.toDate(), "F")} (${discordJs.time(start.toDate(), "R")})\n- **End Date:** ${discordJs.time(end.toDate(), "F")} (${discordJs.time(end.toDate(), "R")})\n- **Duration**: ${end.diff(start, "days", false)} days`
          : "") + quest.description,
      );
    }
    if (quest.image) embed.setImage(quest.image);
    const select = new discordJs.ActionRowBuilder<discordJs.StringSelectMenuBuilder>().addComponents(
      new discordJs.StringSelectMenuBuilder()
        .setCustomId("guide-season-select")
        .setPlaceholder(t("commands.GUIDES.RESPONSES.QUEST_SELECT_PLACEHOLDER"))
        .setOptions(
          quests.map((q, i) => ({
            label: q.title,
            value: (i + 1).toString(),
            default: i === page - 1,
          })),
        ),
    );
    const buttons = new discordJs.ActionRowBuilder<discordJs.ButtonBuilder>().addComponents(
      new discordJs.ButtonBuilder()
        .setCustomId((page - 1).toString())
        .setLabel("◀️ " + (page === 1 ? quest.title : quests[page - 2].title))
        .setDisabled(page === 1)
        .setStyle(discordJs.ButtonStyle.Secondary),
      new discordJs.ButtonBuilder()
        .setCustomId((page + 1).toString())
        .setDisabled(page === total)
        .setLabel(page === total ? quest.title : quests[page].title + " ▶️")
        .setStyle(discordJs.ButtonStyle.Secondary),
    );
    return { embeds: [embed], components: [select, buttons] };
  };
  const msg = await int.editReply(getResponse());
  const collector = msg.createMessageComponentCollector({
    idle: 60_000,
  });
  collector.on("collect", async (compInt) => {
    const id = compInt.customId;
    page = parseInt(id);
    if (compInt.isStringSelectMenu()) page = parseInt(compInt.values[0]);
    await compInt.update(getResponse());
  });
}
