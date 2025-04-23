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
const realms = {
  isle: "Isle of Dawn",
  prairie: "Daylight Prairie",
  forest: "Hidden Forest",
  vault: "Valut of Knowledge",
  wasteland: "Golden Wasteland",
  valley: "Valley of Triumph",
};
const expired_row = row({
  type: ComponentType.StringSelect,
  custom_id: "xxx",
  placeholder: "Expired!",
  options: [{ label: "hmm", value: "dd" }],
  disabled: true,
});
export async function handleRealms(helper: InteractionHelper, options: InteractionOptionResolver) {
  const t = helper.t;
  const realm = options.getString("realm");
  const type = options.getString("type");
  switch (type) {
    case "summary": {
      await handleSummary(helper, `summary_${realm}` as keyof typeof SummaryData);
      return;
    }
    case "maps": {
      await handleMaps(helper, `maps_${realm}` as keyof typeof MapsData);
      return;
    }
    case "spirits": {
      if (realm === "eden") {
        await helper.editReply({ content: t("commands:GUIDES.RESPONSES.NO-SPIRITS") });
        return;
      }
      await handleSpirits(helper, realms[realm as keyof typeof realms]);
    }
  }
}
async function handleSummary(helper: InteractionHelper, realm: keyof typeof SummaryData) {
  const data = getSummary(realm);
  const t = helper.t;
  const client = helper.client;
  let page = 1;
  const total = data.areas.length - 1;
  const author = `Summary of ${data.main.title}`;
  const emoji = realms_emojis[data.main.title];

  const component = container(
    section(
      {
        type: ComponentType.Button,
        label: t("commands:GUIDES.RESPONSES.REALM-BUTTON-LABEL"),
        custom_id: client.utils.encodeCustomId({ id: "areas", user: helper.user.id }),
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
    filter: (i) => (i.member?.user || i.user)!.id === helper.user.id,
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
    const componentID = client.utils.parseCustomId(inter.data.custom_id)!.id;
    switch (componentID) {
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
        page = parseInt((inter as ComponentInteractionMap[ComponentType.StringSelect]).data.values[0].split("_")[1]) + 1;
        break;
      default:
        await compoHelper.editReply({ content: t("commands:GUIDES.RESPONSES.INVALID-CHOICE") });
        return;
    }

    await compoHelper.editReply(getCollectorResponse());
  });

  collector.on("end", async () => {
    const res = getCollectorResponse();
    const comp = res.components[0];
    comp.components.splice(-2, 2, expired_row);
    helper.editReply({ components: [comp] }).catch(() => {});
  });
}

async function handleMaps(helper: InteractionHelper, realm: keyof typeof MapsData) {
  const data = getMaps(realm);
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
    filter: (i) => (i.member?.user || i.user)!.id === helper.user.id,
    message: msg,
  });

  collector.on("collect", async (inter) => {
    const compoCol = new InteractionHelper(inter, helper.client);
    await compoCol.deferUpdate();
    const componentID = helper.client.utils.parseCustomId(inter.data.custom_id)!.id;
    switch (componentID) {
      case "back":
        page--;
        break;
      case "forward":
        page++;
        break;
      case "area-menu":
        page = parseInt((inter as ComponentInteractionMap[ComponentType.StringSelect]).data.values[0].split("_")[1]) + 1;
        break;
    }

    await compoCol.editReply(getCollectorResponse());
  });
  collector.on("end", () => {
    const res = getCollectorResponse();
    const comp = res.components[0];
    comp.components.splice(-2, 2, expired_row);
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
  const embed = data[page - 1];

  const btns: APIActionRowComponent<APIButtonComponent> = {
    type: ComponentType.ActionRow,
    components: [
      {
        type: ComponentType.Button,
        custom_id: Utils.encodeCustomId({ id: "back", user }),
        label: `⬅️ ${data[page - 2]?.title || data[page - 1].title}`,
        disabled: page - 1 === 0,
        style: ButtonStyle.Secondary,
      },
      emoji
        ? {
            type: ComponentType.Button,
            custom_id: Utils.encodeCustomId({ id: "realm", user }),
            emoji: Utils.parseEmoji(emoji),
            label: "Back",
            style: ButtonStyle.Success,
          }
        : undefined,
      {
        type: ComponentType.Button,
        custom_id: Utils.encodeCustomId({ id: "forward", user }),
        label: `${data[page]?.title || data[page - 1].title} ➡️`,
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
        custom_id: Utils.encodeCustomId({ id: "area-menu", user }),
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
    separator(),
    btns,
    separator(),
    menu,
  );

  return { components: [component], flags: MessageFlags.IsComponentsV2 };
}
