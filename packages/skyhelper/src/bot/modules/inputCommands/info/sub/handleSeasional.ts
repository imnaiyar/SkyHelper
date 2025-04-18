import { type SeasonData, seasonsData } from "@skyhelperbot/constants";
import { handleSpirits } from "./handleSpirits.js";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
import { DateTime } from "luxon";
import {
  ButtonStyle,
  ComponentType,
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIEmbed,
  type APISelectMenuComponent,
} from "@discordjs/core";

export async function handleSeasional(helper: InteractionHelper, options: InteractionOptionResolver) {
  const value = options.getString("season")!;
  const type = options.getString("type")!;
  const season = seasonsData[value as keyof typeof seasonsData];
  if (!season) {
    return await helper.editReply({ content: helper.t("commands:GUIDES.RESPONSES.INVALID_SEASON_VALUE", { VALUE: value }) });
  }
  switch (type) {
    case "quest": {
      await handleQuests(helper, season);
      break;
    }
    case "spirits": {
      await handleSpirits(helper, season);
      break;
    }
  }
}

async function handleQuests(helper: InteractionHelper, season: SeasonData) {
  const quests = season.quests;
  const now = DateTime.now().setZone(helper.client.timezone).startOf("day");
  const start = DateTime.fromFormat(season.from[0], "dd-MM-yyyy", { zone: helper.client.timezone }).startOf("day");
  const end = DateTime.fromFormat(season.from[1], "dd-MM-yyyy", { zone: helper.client.timezone }).endOf("day");
  const isActive = now >= start && now <= end;

  const t = helper.t;
  if (!quests?.length) {
    return void helper.editReply({
      content: t("commands:GUIDES.RESPONSES.NO_QUEST", { SEASON: `${season.icon} ${season.name}` }),
    });
  }
  const total = quests.length;
  let page = 1;
  const getResponse = () => {
    const quest = quests[page - 1];
    const emojiUrl = helper.client.rest.cdn.emoji(helper.client.utils.parseEmoji(season.icon)!.id!);
    const embed: APIEmbed = {
      author: {
        name: t("commands:GUIDES.RESPONSES.QUEST_EMBED_AUTHOR", { SEASON: season.name }),
        icon_url: emojiUrl,
      },
      title: `${season.icon} ${quest.title}`,
      url: `https://sky-children-of-the-light.fandom.com/wiki/Season_of_${season.name.split(" ").join("_")}#${quest.title.split(" ").join("_")}`,
      footer: {
        text: "SkyHelper",
        icon_url: helper.client.utils.getUserAvatar(helper.client.user),
      },
      description: quest.description
        ? (isActive
            ? `Season is currently active.\n- **Start Date**: ${helper.client.utils.time(start.toUnixInteger(), "F")} (${helper.client.utils.time(start.toUnixInteger(), "R")})\n- **End Date:** ${helper.client.utils.time(end.toUnixInteger(), "F")} (${helper.client.utils.time(end.toUnixInteger(), "R")})\n- **Duration**: ${Math.round(end.diff(start, "days").days)} days`
            : "") + quest.description
        : undefined,
      image: quest.image ? { url: quest.image } : undefined,
    };

    const select: APIActionRowComponent<APISelectMenuComponent> = {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.StringSelect,
          custom_id: helper.client.utils.encodeCustomId({ id: "guide-season-select", user: helper.user.id }),
          placeholder: t("commands:GUIDES.RESPONSES.QUEST_SELECT_PLACEHOLDER"),
          options: quests.map((q, i) => ({
            label: q.title,
            value: (i + 1).toString(),
            default: i === page - 1,
          })),
        },
      ],
    };

    const buttons: APIActionRowComponent<APIButtonComponent> = {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.Button,
          custom_id: helper.client.utils.encodeCustomId({ id: (page - 1).toString(), user: helper.user.id }),
          label: "◀️ " + (page === 1 ? quest.title : quests[page - 2].title),
          disabled: page === 1,
          style: ButtonStyle.Secondary,
        },
        {
          type: ComponentType.Button,
          custom_id: helper.client.utils.encodeCustomId({ id: (page + 1).toString(), user: helper.user.id }),
          label: page === total ? quest.title : quests[page].title + " ▶️",
          disabled: page === total,
          style: ButtonStyle.Secondary,
        },
      ],
    };
    return { embeds: [embed], components: [select, buttons] };
  };
  const msg = await helper.editReply(getResponse());
  const collector = helper.client.componentCollector({
    idle: 60_000,
    message: msg,
    filter: (i) => (i.member?.user || i.user)!.id === helper.user.id,
  });
  collector.on("collect", async (compInt) => {
    const id = helper.client.utils.parseCustomId(compInt.data.custom_id)!.id;
    const compHelper = new InteractionHelper(compInt, helper.client);
    page = parseInt(id);
    if (compHelper.isStringSelect(compInt)) page = parseInt(compInt.data.values[0]);
    await compHelper.update(getResponse());
  });
}
