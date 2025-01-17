import { getTSStatus as getTS } from "#utils";
import { seasonsData, Spirits } from "#libs";
import type { SpiritsData } from "@skyhelperbot/constants/spirits-datas";
import type { Command, SkyHelper } from "#structures";
import { EmbedBuilder, time, type BaseMessageOptions } from "discord.js";
import type { getTranslator } from "#bot/i18n";
import { TRAVELING_SPIRITS_DATA } from "#bot/commands/commands-data/info-commands";
const isSeasonal = (data: SpiritsData) => "ts" in data;
export default {
  async interactionRun(interaction, t, client) {
    await interaction.deferReply();
    await interaction.editReply(await getTSResponse(client, t));
  },
  async messageRun({ message, client, t }) {
    await message.reply(await getTSResponse(client, t));
  },
  ...TRAVELING_SPIRITS_DATA,
} satisfies Command;

const getTSResponse = async (client: SkyHelper, t: ReturnType<typeof getTranslator>): Promise<BaseMessageOptions | string> => {
  const ts = await getTS();

  if (!ts) return t("commands:TRAVELING-SPIRIT.RESPONSES.NO_DATA");

  const visitingDates = `${time(ts.nextVisit.toDate(), "D")} - ${time(ts.nextVisit.clone().add(3, "days").endOf("day").toDate(), "D")}`;
  if (ts.value) {
    const spirit: SpiritsData = client.spiritsData[ts.value as keyof typeof client.spiritsData];
    if (!isSeasonal(spirit)) return t("commands:TRAVELING-SPIRIT.RESPONSES.NO_DATA");
    const emote = spirit.expression?.icon || "<:spiritIcon:1206501060303130664>";
    let description = ts.visiting
      ? t("commands:TRAVELING-SPIRIT.RESPONSES.VISITING", {
          SPIRIT: "↪",
          TIME: time(ts.nextVisit.clone().add(3, "days").endOf("day").toDate(), "F"),
          DURATION: ts.duration,
        })
      : t("commands:TRAVELING-SPIRIT.RESPONSES.EXPECTED", {
          SPIRIT: "↪",
          DATE: time(ts.nextVisit.toDate(), "F"),
          DURATION: ts.duration,
        });
    description += `\n\n**${t("commands:TRAVELING-SPIRIT.RESPONSES.VISITING_TITLE")}** ${visitingDates}\n**${t("features:SPIRITS.REALM_TITLE")}:** ${
      client.emojisMap.get("realms")![spirit.realm!]
    } ${spirit.realm}\n**${t("features:SPIRITS.SEASON_TITLE")}:** ${Object.values(seasonsData).find((v) => v.name === spirit.season)?.icon} Season of ${spirit.season!}`;
    const embed = new EmbedBuilder()
      .setAuthor({ name: t("commands:TRAVELING-SPIRIT.RESPONSES.EMBED_AUTHOR", { INDEX: ts.index }), iconURL: spirit.image })
      .setDescription(description)
      .setTitle(emote! + " " + spirit.name + (spirit.extra ? ` (${spirit.extra})` : ""))
      .addFields({
        name: spirit.ts?.returned
          ? t("features:SPIRITS.TREE_TITLE", { CREDIT: spirit.tree!.by })
          : t("features:SPIRITS.SEASONAL_CHART", { CREDIT: spirit.tree!.by }),
        value: spirit
          .tree!.total.replaceAll(":RegularCandle:", "<:RegularCandle:1207793250895794226>")
          .replaceAll(":RegularHeart:", "<:regularHeart:1207793247792013474>")
          .replaceAll(":AC:", "<:AscendedCandle:1207793254301433926>"),
      })
      .setImage("https://cdn.imnaiyar.site/" + spirit.tree!.image);
    if (spirit.image) embed.setThumbnail(spirit.image);
    const manager = new Spirits(spirit, t, client);
    return { embeds: [embed], components: [manager.getButtons()] };
  } else {
    let description = ts.visiting
      ? t("commands:TRAVELING-SPIRIT.RESPONSES.VISITING", {
          SPIRIT: t("features:SPIRITS.UNKNOWN"),
          TIME: time(ts.nextVisit.clone().add(3, "days").endOf("day").toDate(), "F"),
          DURATION: ts.duration,
        })
      : t("commands:TRAVELING-SPIRIT.RESPONSES.EXPECTED", {
          SPIRIT: t("features:SPIRITS.UNKNOWN"),
          DATE: time(ts.nextVisit.toDate(), "F"),
          DURATION: ts.duration,
        });
    description += `\n\n**${t("commands:TRAVELING-SPIRIT.RESPONSES.VISITING_TITLE")}** ${visitingDates}`;
    const embed = new EmbedBuilder()
      .setAuthor({ name: t("commands:TRAVELING-SPIRIT.RESPONSES.EMBED_AUTHOR", { INDEX: "X" }) })
      .setDescription(description);
    return { embeds: [embed] };
  }
};
