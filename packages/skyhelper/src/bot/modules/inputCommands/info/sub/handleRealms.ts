import { MapsData, SummaryData, getMaps, getSummary, realms_emojis } from "@skyhelperbot/constants";
import { handleSpirits } from "./handleSpirits.js";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
import {
  ButtonStyle,
  ComponentType,
  MessageFlags,
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIStringSelectComponent,
} from "@discordjs/core";
import type { ComponentInteractionMap } from "@/types/interactions";
import Utils from "@/utils/classes/Utils";
import { container, mediaGallery, mediaGalleryItem, row, section, separator, textDisplay, thumbnail } from "@skyhelperbot/utils";
import { CustomId } from "@/utils/customId-store";
import { fetchSkyData } from "@/planner";
import type { IRealm } from "skygame-data";

const expired_row = row({
  type: ComponentType.StringSelect,
  custom_id: "xxx",
  placeholder: "Expired!",
  options: [{ label: "hmm", value: "dd" }],
  disabled: true,
});
export async function handleRealms(helper: InteractionHelper, options: InteractionOptionResolver) {
  const t = helper.t;
  const realmId = options.getString("realm", true);
  const type = options.getString("type", true);

  const data = await fetchSkyData(helper.client);
  const realm = data.guids.get(realmId) as IRealm | undefined;

  if (!realm) {
    await helper.editReply({
      content: t("commands:SPIRITS.RESPONSES.NO_DATA", {
        VALUE: realmId,
        COMMAND: helper.client.utils.mentionCommand(helper.client, "utils", "contact-us"),
      }),
    });
    return;
  }

  switch (type) {
    case "summary": {
      // TODO: refactor this to use <IREALM>.areas
      await handleSummary(helper, `summary_${realm.shortName.toLowerCase()}` as keyof typeof SummaryData);
      return;
    }
    case "maps": {
      // TODO: refactor this to possibly use <IRealm>.maps, though may require image generations
      await handleMaps(helper, `maps_${realm.shortName.toLowerCase()}` as keyof typeof MapsData);
      return;
    }
    case "spirits": {
      if (realm.shortName === "Eden") {
        await helper.editReply({ content: t("commands:GUIDES.RESPONSES.NO-SPIRITS") });
        return;
      }
      await handleSpirits(helper, realm, data);
    }
  }
}
async function handleSummary(helper: InteractionHelper, realm: keyof typeof SummaryData) {
  const data = getSummary(realm);
  if (!(data as any)) {
    // TODO: for now, should no longer be the case when migrated to planer data
    await helper.editReply({
      content:
        "No Summary found for this realm! This feature is considered legacy and no updates will be done and may have missing data for newer additions.",
    });
    return;
  }
  const { t, client } = helper;
  let page = 1;
  const total = data.areas.length - 1;
  const author = `Summary of ${data.main.title}`;
  const emoji = client.utils.formatEmoji(realms_emojis[data.main.title]);

  const component = container(
    section(
      {
        type: ComponentType.Button,
        label: t("commands:GUIDES.RESPONSES.REALM-BUTTON-LABEL"),
        custom_id: client.utils.store.serialize(CustomId.RealmsBaseNav, { type: "areas", user: helper.user.id }),
        style: ButtonStyle.Secondary,
      },
      `-# ${author}`,
      `### [${emoji} ${data.main.title}](https://sky-children-of-the-light.fandom.com/wiki/${data.main.title.split(" ").join("_")})`,
    ),
    separator(),
    section(thumbnail(data.main.image, data.main.title), data.main.description),
  );

  const msg = await helper.editReply({
    components: [component],
    flags: MessageFlags.IsComponentsV2,
  });

  const collector = client.componentCollector({
    idle: 2 * 60_1000,
    message: msg,
    filter: (i) => (i.member?.user ?? i.user)!.id === helper.user.id,
  });
  const getCollectorResponse = () =>
    getRealmsRow(
      data.areas,
      page,
      total,
      author,
      emoji,
      data.main.title,
      t("commands:GUIDES.RESPONSES.REALM_AREA_SELECT_PLACEHOLDER"),
      helper.user.id,
    );

  collector.on("collect", async (inter) => {
    const compoHelper = new InteractionHelper(inter, client);
    await compoHelper.deferUpdate();
    const { id, data: value } = client.utils.store.deserialize(inter.data.custom_id);
    if (id !== CustomId.RealmsBaseNav) {
      await compoHelper.editReply({ content: t("commands:GUIDES.RESPONSES.INVALID-CHOICE") });
      return;
    }

    switch (value.type) {
      case "areas":
        break; // no need to do anything, just update the embed
      case "back":
        page--;
        break;
      case "forward":
        page++;
        break;
      case "realm":
        page = 1;
        await compoHelper.editReply({
          components: [component],
        });
        return;
      case "area-menu":
        page = parseInt((inter as ComponentInteractionMap[ComponentType.StringSelect]).data.values[0]!.split("_")[1]!) + 1;
        break;
      default:
        await compoHelper.editReply({ content: t("commands:GUIDES.RESPONSES.INVALID-CHOICE") });
        return;
    }

    await compoHelper.editReply(getCollectorResponse());
  });

  collector.on("end", () => {
    const res = getCollectorResponse();
    const comp = res.components[0]!;
    comp.components.splice(-3, 3, expired_row);
    helper.editReply({ components: [comp] }).catch(() => {});
  });
}

async function handleMaps(helper: InteractionHelper, realm: keyof typeof MapsData) {
  const data = getMaps(realm);
  if (!(data as any)) {
    // TODO: for now, should no longer be the case when migrated to planer data
    await helper.editReply({
      content:
        "No Maps found for this realm! This feature is considered legacy and no updates will be done and may have missing data for newer additions.",
    });
    return;
  }
  const t = helper.t;
  let page = 1;
  const total = data.maps.length - 1;
  const author = `Maps of ${data.realm}`;
  const getCollectorResponse = () =>
    getRealmsRow(
      data.maps,
      page,
      total,
      author,
      undefined,
      data.realm,
      t("commands:GUIDES.RESPONSES.REALM_AREA_SELECT_PLACEHOLDER"),
      helper.user.id,
      data.content,
    );

  const msg = await helper.editReply(getCollectorResponse());

  const collector = helper.client.componentCollector({
    idle: 2 * 60_000,
    filter: (i) => (i.member?.user ?? i.user)!.id === helper.user.id,
    message: msg,
  });

  collector.on("collect", async (inter) => {
    const compoCol = new InteractionHelper(inter, helper.client);
    await compoCol.deferUpdate();
    const { id, data: value } = Utils.store.deserialize(inter.data.custom_id);
    if (id !== CustomId.RealmsBaseNav) {
      await compoCol.editReply({ content: t("commands:GUIDES.RESPONSES.INVALID-CHOICE") });
      return;
    }

    switch (value.type) {
      case "back":
        page--;
        break;
      case "forward":
        page++;
        break;
      case "area-menu":
        page = parseInt((inter as ComponentInteractionMap[ComponentType.StringSelect]).data.values[0]!.split("_")[1]!) + 1;
        break;
    }

    await compoCol.editReply(getCollectorResponse());
  });
  collector.on("end", () => {
    const res = getCollectorResponse();
    const comp = res.components[0]!;
    comp.components.splice(-3, 3, expired_row);
    helper.editReply({ components: [comp] }).catch(() => {});
  });
}
type SummaryDataType = (typeof SummaryData)[keyof typeof SummaryData]["areas"];
type MapsDataType = (typeof MapsData)[keyof typeof MapsData]["maps"];

function getRealmsRow(
  data: SummaryDataType | MapsDataType,
  page: number,
  total: number,
  author: string,
  emoji: string | undefined,
  realm: string,
  t: string,
  user: string,
  content?: string,
) {
  const embed = data[page - 1]!;

  const btns: APIActionRowComponent<APIButtonComponent> = {
    type: ComponentType.ActionRow,
    components: [
      {
        type: ComponentType.Button,
        custom_id: Utils.store.serialize(CustomId.RealmsBaseNav, { type: "back", user }),
        label: `⬅ ${data[page - 2]?.title ?? data[page - 1]?.title}`,
        disabled: page - 1 === 0,
        style: ButtonStyle.Secondary,
      },
      emoji
        ? {
            type: ComponentType.Button,
            custom_id: Utils.store.serialize(CustomId.RealmsBaseNav, { type: "realm", user }),
            emoji: Utils.parseEmoji(emoji),
            label: "Back",
            style: ButtonStyle.Success,
          }
        : undefined,
      {
        type: ComponentType.Button,
        custom_id: Utils.store.serialize(CustomId.RealmsBaseNav, { type: "forward", user }),
        label: `${data[page]?.title ?? data[page - 1]?.title} ➡`,
        disabled: page - 1 === total,
        style: ButtonStyle.Secondary,
      },
    ].filter(Boolean) as APIButtonComponent[],
  };

  const menu: APIActionRowComponent<APIStringSelectComponent> = {
    type: ComponentType.ActionRow,
    components: [
      {
        type: ComponentType.StringSelect,
        placeholder: t,
        custom_id: Utils.store.serialize(CustomId.RealmsBaseNav, { type: "area-menu", user }),
        options: data.map((area, index) => ({
          label: area.title,
          default: area.title === embed.title,
          value: "area_" + index.toString(),
        })),
      },
    ],
  };

  const component = container(
    textDisplay(
      `-# ${author}`,
      `### [${embed.title}](${
        content
          ? `https://sky-children-of-the-light.fandom.com/wiki/${realm.split(" ").join("_")}#Maps`
          : `https://sky-children-of-the-light.fandom.com/wiki/${realm.split(" ").join("_")}#${embed.title.split(" ").join("_")}`
      })`,
      content ?? "",
    ),
    separator(),
    "description" in embed
      ? section(thumbnail(embed.image, embed.title), embed.description)
      : mediaGallery(mediaGalleryItem(embed.image, { description: embed.title })),
    textDisplay(`-# Page ${page}/${total + 1}`),
    separator(true, 1),
    btns,
    separator(true, 1),
    menu,
  );

  return { components: [component], flags: MessageFlags.IsComponentsV2 };
}
