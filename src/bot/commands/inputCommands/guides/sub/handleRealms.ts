import { MapsData, SummaryData, getMaps, getSummary } from "#libs";
import type { SkyHelper } from "#structures";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  type ChatInputCommandInteraction,
} from "discord.js";
import { handleSpirits } from "./handleSpirits.js";
const realms = {
  isle: "Isle of Dawn",
  prairie: "Daylight Prairie",
  forest: "Hidden Forest",
  vault: "Valut of Knowledge",
  wasteland: "Golden Wasteland",
  valley: "Valley of Triumph",
};
export async function handleRealms(interaction: ChatInputCommandInteraction) {
  const t = await interaction.t();
  const realm = interaction.options.getString("realm");
  const type = interaction.options.getString("type");
  switch (type) {
    case "summary": {
      await handleSummary(interaction, `summary_${realm}` as keyof typeof SummaryData);
      return;
    }
    case "maps": {
      await handleMaps(interaction, `maps_${realm}` as keyof typeof MapsData);
      return;
    }
    case "spirits": {
      if (realm === "eden") {
        await interaction.followUp({ content: t("commands:GUIDES.RESPONSES.NO-SPIRITS") });
        return;
      }
      await handleSpirits(interaction, realms[realm as keyof typeof realms]);
    }
  }
}
async function handleSummary(interaction: ChatInputCommandInteraction, realm: keyof typeof SummaryData) {
  const data = getSummary(realm);
  const t = await interaction.t();
  const client = interaction.client as SkyHelper;
  let page = 1;
  const total = data.areas.length - 1;
  const author = `Summary of ${data.main.title}`;
  const emoji = client.emojisMap.get("realms")![realm];
  const embed = new EmbedBuilder()
    .setTitle(`${emoji} ${data.main.title}`)
    .setURL(`https://sky-children-of-the-light.fandom.com/wiki/${data.main.title.split(" ").join("_")}`)
    .setDescription(data.main.description)
    .setAuthor({ name: author })
    .setImage(data.main?.image);

  const rowFirst = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel(t("commands:GUIDES.RESPONSES.REALM-BUTTON-LABEL"))
      .setCustomId("areas")
      .setStyle(ButtonStyle.Primary),
  );
  const msg = await interaction.followUp({
    embeds: [embed],
    components: [rowFirst],
  });

  const collector = msg.createMessageComponentCollector({
    idle: 2 * 60_1000,
  });

  collector.on("collect", async (inter) => {
    if (inter.user.id !== interaction.user.id) {
      await inter.deferReply({ ephemeral: true });
      const ts = await inter.t();
      await inter.editReply({ content: ts("common:SELECT_EXPIRED") });
      return;
    }
    await inter.deferUpdate();
    const componentID = inter.customId;
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
        );
        await inter.editReply(datas);
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
        );
        await inter.editReply(datas);
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
        );
        await inter.editReply(datas);
        break;
      }
      case "realm": {
        page = 1;
        await inter.editReply({
          embeds: [embed],
          components: [rowFirst],
        });
        break;
      }
      case "area-menu": {
        page = parseInt((inter as StringSelectMenuInteraction).values[0].split("_")[1]) + 1;
        const datas = getRealmsRow(
          data.areas,
          page,
          total,
          author,
          emoji,
          data.main.title,
          t("commands:GUIDES.RESPONSES.REALM_AREA_SELECT_PLACEHOLDER"),
        );
        await inter.editReply(datas);
        break;
      }
      default:
        await inter.editReply({ content: t("commands:GUIDES.RESPONSES.INVALID-CHOICE") });
    }
  });

  collector.on("end", async () => {
    msg
      .fetch()
      .then((m) => {
        m.edit({
          components: [],
        });
      })
      .catch(() => {});
  });
}

async function handleMaps(interaction: ChatInputCommandInteraction, realm: keyof typeof MapsData) {
  const data = getMaps(realm);
  const t = await interaction.t();
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
    true,
  );
  const msg = await interaction.followUp({
    content: data?.content,
    ...row,
  });

  const collector = msg.createMessageComponentCollector({
    idle: 2_60_1000,
  });

  collector.on("collect", async (inter) => {
    if (inter.user.id !== interaction.user.id) {
      await inter.deferReply({ ephemeral: true });
      const ts = await inter.t();
      await inter.editReply({ content: ts("common:SELECT_EXPIRED") });
      return;
    }
    await inter.deferUpdate();
    const componentID = inter.customId;
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
          true,
        );
        await inter.editReply(datas);
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
          true,
        );
        await inter.editReply(datas);
        break;
      }
      case "area-menu": {
        page = parseInt((inter as StringSelectMenuInteraction).values[0].split("_")[1]) + 1;
        const datas = getRealmsRow(
          data.maps,
          page,
          total,
          author,
          undefined,
          data.realm,
          t("commands:GUIDES.RESPONSES.REALM_AREA_SELECT_PLACEHOLDER"),
          true,
        );
        await inter.editReply(datas);
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
  map?: boolean,
) {
  const embed = data[page - 1];
  const emb = new EmbedBuilder()
    .setTitle(embed.title)
    .setImage(embed?.image)
    .setAuthor({ name: author })
    .setFooter({ text: `Page ${page}/${total + 1}` });
  if ("description" in embed) {
    emb.setDescription(embed.description);
  }

  if (map) {
    emb.setURL(`https://sky-children-of-the-light.fandom.com/wiki/${realm.split(" ").join("_")}#Maps`);
  } else {
    emb.setURL(
      `https://sky-children-of-the-light.fandom.com/wiki/${realm.split(" ").join("_")}#${embed.title.split(" ").join("_")}`,
    );
  }
  const row = [];
  const btns = new ActionRowBuilder<ButtonBuilder>();

  btns.addComponents(
    new ButtonBuilder()
      .setCustomId("back")
      .setLabel(`⬅️ ${data[page - 2]?.title || data[page - 1].title}`)
      .setDisabled(page - 1 === 0)
      .setStyle(ButtonStyle.Secondary),
  );

  if (emoji) {
    btns.addComponents(new ButtonBuilder().setCustomId("realm").setEmoji(emoji).setStyle(ButtonStyle.Success));
  }

  btns.addComponents(
    new ButtonBuilder()
      .setCustomId("forward")
      .setLabel(`${data[page]?.title || data[page - 1].title} ➡️`)
      .setDisabled(page - 1 === total)
      .setStyle(ButtonStyle.Secondary),
  );

  const menu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setPlaceholder(t)
      .setCustomId("area-menu")
      .addOptions(
        data.map((area, index) => ({
          label: area.title,
          default: area.title === embed.title,
          value: "area_" + index.toString(),
        })),
      ),
  );
  row.push(menu, btns);
  return { embeds: [emb], components: row };
}
