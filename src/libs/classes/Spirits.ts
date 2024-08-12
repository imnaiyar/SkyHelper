import { RegularSpiritData, SeasonalSpiritData, seasonsData, type SpiritsData } from "#libs";
import type { SkyHelper } from "#structures";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, time } from "discord.js";
import config from "#src/config";
import moment from "moment-timezone";
import { getTranslator } from "#src/i18n";

// Define location Btn (Tree btn is defined/handled when location button is clicked)
const lctnBtn = (value: string) =>
  new ButtonBuilder()
    .setCustomId("spirit_common-location-" + value)
    .setLabel("Location")
    .setStyle(ButtonStyle.Secondary);

// Define Cosmetic Button
const cosmeticBtn = (icon: string, value: string) =>
  new ButtonBuilder()
    .setCustomId("spirit_cosmetic-" + value)
    .setEmoji(icon)
    .setStyle(ButtonStyle.Success)
    .setLabel("Cosmetic(s)");

const getExpressionBtn = (data: SpiritsData, value: string, t: ReturnType<typeof getTranslator>, icon: string): ButtonBuilder =>
  new ButtonBuilder()
    .setCustomId(
      (data.call ? "spirit_emote-call" : data.stance ? "spirit_emote-stance" : "spirit_emote-expression") + `-${value}`,
    )
    .setLabel(
      data.emote
        ? t("commands.SPIRITS.RESPONSES.BUTTONS.EMOTE")
        : data.stance
          ? t("commands.SPIRITS.RESPONSES.BUTTONS.STANCE")
          : data.call
            ? t("commands.SPIRITS.RESPONSES.BUTTONS.CALL")
            : t("commands.SPIRITS.RESPONSES.BUTTONS.ACTION"),
    )
    .setEmoji(icon)
    .setStyle(ButtonStyle.Primary);

/**
 * Handle Spirit data and interactions
 */
export class Spirits {
  constructor(
    private data: SpiritsData,
    private t: ReturnType<typeof getTranslator>,
    private client: SkyHelper,
  ) {
    this.data = data;
    this.client = client;
  }

  /**
   * Get the embed for the spirit response
   */
  public getEmbed(): EmbedBuilder {
    const data = this.data;
    const client = this.client;
    const icon =
      data.emote?.icon ??
      data.call?.icon ??
      data.stance?.icon ??
      data.action?.icon ??
      data.icon ??
      "<:spiritIcon:1206501060303130664>";
    const desc = `${this.t("commands.SPIRITS.RESPONSES.EMBED.TYPE", { SPIRIT_TYPE: data.type })}${
      data.realm
        ? `\n${this.t("commands.SPIRITS.RESPONSES.EMBED.REALM", { REALM: `${client.emojisMap.get("realms")![data.realm]} ${data.realm}` })}`
        : ""
    }${this.isSeasonal(data) && data.season ? `\n${this.t("commands.SPIRITS.RESPONSES.EMBED.SEASON", { SEASON: client.emojisMap.get("seasons")![data.season] + ` ${this.t("commands.GUIDES.RESPONSES.SPIRIT_SELECT_PLACEHOLDER", { SEASON: data.season })}` })}` : ""}`;
    const embed = new EmbedBuilder()
      .setTitle(`${icon} ${data.name}`)
      .setURL(`https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}`)
      .setDescription(desc)
      .setAuthor({ name: this.t("commands.SPIRITS.RESPONSES.EMBED.FIELDS.SUMMARY_TITLE") });
    if ("ts" in data && !data.current) {
      embed.addFields({
        name: "TS Summary",
        value: !data.ts.eligible
          ? `- ${this.t("commands.SPIRITS.RESPONSES.EMBED.FIELDS.SUMMARY_DESC_NO_ELIGIBLE", {
              SEASON:
                Object.values(seasonsData).find((v) => v.name === data.season)?.icon +
                ` **__${this.t("commands.GUIDES.RESPONSES.SPIRIT_SELECT_PLACEHOLDER", { SEASON: data.season })}__`,
            })}`
          : data.ts.returned
            ? `${this.t("commands.SPIRITS.RESPONSES.EMBED.FIELDS.SUMMARY_DESC_RETURNED", { VISITS: data.ts.dates.length })}\n${data.ts.dates
                .map((date) => {
                  let index;
                  const formatDate = date
                    .replace(/\([^)]+\)/g, (match) => {
                      index = match.trim();
                      return "";
                    })
                    .trim();
                  const dateM = moment.tz(formatDate, "MMMM DD, YYYY", "America/Los_Angeles").startOf("day");
                  const dateE = dateM.clone().add(3, "days").endOf("day");
                  return `- ${time(dateM.toDate(), "D")} - ${time(dateE.toDate(), "D")} ${index}`;
                })
                .join("\n")}`
            : `- ${this.t("commands.SPIRITS.RESPONSES.EMBED.FIELDS.SUMMARY_DESC_NO_VISIT")}`,
      });
    }

    if (!this.isSeasonal(data)) {
      embed.addFields({ name: this.t("commands.SPIRITS.RESPONSES.EMBED.CREDIT"), value: " " });
      embed.setImage(`${config.CDN_URL}/${data.main.image}`);
    } else {
      // For seasonal spirits
      embed.addFields({
        name: data.ts?.returned
          ? this.t("SPIRITS.TREE_TITLE", { CREDIT: data.tree!.by })
          : this.t("SPIRITS.SEASONAL_CHART", { CREDIT: data.tree!.by }),
        value: data
          .tree!.total.replaceAll(":RegularCandle:", "<:RegularCandle:1207793250895794226>")
          .replaceAll(":RegularHeart:", "<:regularHeart:1207793247792013474>")
          .replaceAll(":AC:", "<:AscendedCandle:1207793254301433926>"),
      });
      embed.setImage(`${config.CDN_URL}/${data.tree!.image}`);
    }
    return embed;
  }

  /**
   * Get the buttons for the spirit response
   */
  public getButtons(): ActionRowBuilder<ButtonBuilder> {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const data = this.data;
    const [value] = Object.entries(this.client.spiritsData).find(([, v]) => v.name.toLowerCase() === data.name.toLowerCase())!;
    if (this.isSeasonal(data) && data.location) row.addComponents(lctnBtn(value));
    // prettier-ignore
    if (data.emote || data.stance || data.action || data.call) row.addComponents(getExpressionBtn(data, value, this.t, (data.emote?.icon ?? data.call?.icon ?? data.stance?.icon ?? data.action?.icon) as string));

    if (data.cosmetics?.length) {
      row.addComponents(cosmeticBtn(data.cosmetics[Math.floor(Math.random() * data.cosmetics.length)].icon, value));
    }

    return row;
  }

  isSeasonal(data: SpiritsData): data is SeasonalSpiritData {
    return "ts" in data;
  }

  isRegular(data: SpiritsData): data is RegularSpiritData {
    return "ts" in data;
  }
}
