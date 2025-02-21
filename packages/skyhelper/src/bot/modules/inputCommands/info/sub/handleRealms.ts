import { MapsData, SummaryData, getMaps, getSummary } from "@skyhelperbot/constants";
import { handleSpirits } from "./handleSpirits.js";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
import {
  ButtonStyle,
  ComponentType,
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIEmbed,
  type APIStringSelectComponent,
} from "@discordjs/core";
import type { ComponentInteractionMap } from "@/types/interactions";
import Utils from "@/utils/classes/Utils";
const realms = {
  isle: "Isle of Dawn",
  prairie: "Daylight Prairie",
  forest: "Hidden Forest",
  vault: "Valut of Knowledge",
  wasteland: "Golden Wasteland",
  valley: "Valley of Triumph",
};
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
  const emoji = client.emojisMap.get("realms")![realm];
  const embed: APIEmbed = {
    title: `${emoji} ${data.main.title}`,
    url: `https://sky-children-of-the-light.fandom.com/wiki/${data.main.title.split(" ").join("_")}`,
    description: data.main.description,
    author: { name: author },
    image: { url: data.main?.image },
  };

  const rowFirst: APIActionRowComponent<APIButtonComponent> = {
    type: ComponentType.ActionRow,
    components: [
      {
        type: ComponentType.Button,
        label: t("commands:GUIDES.RESPONSES.REALM-BUTTON-LABEL"),
        custom_id: client.utils.encodeCustomId({ id: "areas", user: helper.user.id }),
        style: ButtonStyle.Primary,
      },
    ],
  };
  const msg = await helper.editReply({
    embeds: [embed],
    components: [rowFirst],
  });

  const collector = client.componentCollector({
    idle: 2 * 60_1000,
    message: msg,
    filter: (i) => (i.member?.user || i.user)!.id === helper.user.id,
  });

  collector.on("collect", async (inter) => {
    const compoHelper = new InteractionHelper(inter, client);
    await compoHelper.deferUpdate();
    const componentID = client.utils.parseCustomId(inter.data.custom_id)!.id;
    switch (componentID) {
      case "areas": {
        const datas = getRealmsRow(
          data.areas,
          page,
          total,
          author,
          emoji,
          data.main.title,
          t("commands:GUIDES.RESPONSES.REALM_AREA_SELECT_PLACEHOLDER"),
          helper.user.id,
        );
        await compoHelper.editReply(datas);
        break;
      }
      case "back": {
        page--;
        const datas = getRealmsRow(
          data.areas,
          page,
          total,
          author,
          emoji,
          data.main.title,
          t("commands:GUIDES.RESPONSES.REALM_AREA_SELECT_PLACEHOLDER"),
          helper.user.id,
        );
        await compoHelper.editReply(datas);
        break;
      }
      case "forward": {
        page++;
        const datas = getRealmsRow(
          data.areas,
          page,
          total,
          author,
          emoji,
          data.main.title,
          t("commands:GUIDES.RESPONSES.REALM_AREA_SELECT_PLACEHOLDER"),
          helper.user.id,
        );
        await compoHelper.editReply(datas);
        break;
      }
      case "realm": {
        page = 1;
        await compoHelper.editReply({
          embeds: [embed],
          components: [rowFirst],
        });
        break;
      }
      case "area-menu": {
        page = parseInt((inter as ComponentInteractionMap[ComponentType.StringSelect]).data.values[0].split("_")[1]) + 1;
        const datas = getRealmsRow(
          data.areas,
          page,
          total,
          author,
          emoji,
          data.main.title,
          t("commands:GUIDES.RESPONSES.REALM_AREA_SELECT_PLACEHOLDER"),
          helper.user.id,
        );
        await compoHelper.editReply(datas);
        break;
      }
      default:
        await compoHelper.editReply({ content: t("commands:GUIDES.RESPONSES.INVALID-CHOICE") });
    }
  });

  collector.on("end", async () => {
    helper
      .editReply({
        components: [],
      })
      .catch(() => {});
  });
}

async function handleMaps(helper: InteractionHelper, realm: keyof typeof MapsData) {
  const data = getMaps(realm);
  const t = helper.t;
  let page = 1;
  const total = data.maps.length - 1;
  const author = `Maps of ${data.realm}`;
  const row = getRealmsRow(
    data.maps,
    page,
    total,
    author,
    undefined,
    data.realm,
    t("commands:GUIDES.RESPONSES.REALM_AREA_SELECT_PLACEHOLDER"),
    helper.user.id,
    true,
  );
  const msg = await helper.editReply({
    content: data?.content,
    ...row,
  });

  const collector = helper.client.componentCollector({
    idle: 2_60_1000,
    filter: (i) => (i.member?.user || i.user)!.id === helper.user.id,
    message: msg,
  });

  collector.on("collect", async (inter) => {
    const compoCol = new InteractionHelper(inter, helper.client);
    await compoCol.deferUpdate();
    const componentID = helper.client.utils.parseCustomId(inter.data.custom_id)!.id;
    switch (componentID) {
      case "back": {
        page--;
        const datas = getRealmsRow(
          data.maps,
          page,
          total,
          author,
          undefined,
          data.realm,
          t("commands:GUIDES.RESPONSES.REALM_AREA_SELECT_PLACEHOLDER"),
          helper.user.id,
          true,
        );
        await compoCol.editReply(datas);
        break;
      }
      case "forward": {
        page++;
        const datas = getRealmsRow(
          data.maps,
          page,
          total,
          author,
          undefined,
          data.realm,
          t("commands:GUIDES.RESPONSES.REALM_AREA_SELECT_PLACEHOLDER"),
          helper.user.id,
          true,
        );
        await compoCol.editReply(datas);
        break;
      }
      case "area-menu": {
        page = parseInt((inter as ComponentInteractionMap[ComponentType.StringSelect]).data.values[0].split("_")[1]) + 1;
        const datas = getRealmsRow(
          data.maps,
          page,
          total,
          author,
          undefined,
          data.realm,
          t("commands:GUIDES.RESPONSES.REALM_AREA_SELECT_PLACEHOLDER"),
          helper.user.id,
          true,
        );
        await compoCol.editReply(datas);
        break;
      }
    }
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
  map?: boolean,
) {
  const embed = data[page - 1];
  const emb: APIEmbed = {
    title: embed.title,
    image: { url: embed.image },
    author: { name: author },
    footer: { text: `Page ${page}/${total + 1}` },
    url: map
      ? `https://sky-children-of-the-light.fandom.com/wiki/${realm.split(" ").join("_")}#Maps`
      : `https://sky-children-of-the-light.fandom.com/wiki/${realm.split(" ").join("_")}#${embed.title.split(" ").join("_")}`,
  };

  if ("description" in embed) {
    emb.description = embed.description;
  }

  const row: APIActionRowComponent<APIButtonComponent | APIStringSelectComponent>[] = [];

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
      {
        type: ComponentType.Button,
        custom_id: Utils.encodeCustomId({ id: "realm", user }),
        emoji: { name: emoji },
        label: "Back",
        style: ButtonStyle.Success,
      },
      {
        type: ComponentType.Button,
        custom_id: Utils.encodeCustomId({ id: "forward", user }),
        label: `${data[page]?.title || data[page - 1].title} ➡️`,
        disabled: page - 1 === total,
        style: ButtonStyle.Secondary,
      },
    ],
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

  row.push(menu, btns);
  return { embeds: [emb], components: row };
}
