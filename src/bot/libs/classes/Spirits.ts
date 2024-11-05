import { seasonsData } from "#libs";
import type { SpiritsData, SeasonalSpiritData, RegularSpiritData } from "#libs/constants/spirits-datas/type";
import type { SkyHelper } from "#structures";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, time } from "discord.js";
import config from "#bot/config";
import moment from "moment-timezone";
import { getTranslator } from "#bot/i18n";

// Define location Btn (Tree btn is defined/handled when location button is clicked)
const lctnBtn = (value: string) =>
  new ButtonBuilder()
    .setCustomId("spirit_common-location-" + value)
    .setLabel("Location")
    .setStyle(ButtonStyle.Secondary);

// Define Cosmetic Button
const collectiblesBtn = (icon: string, value: string) =>
  new ButtonBuilder()
    .setCustomId("spirit_collectible-" + value)
    .setEmoji(icon)
    .setStyle(ButtonStyle.Success)
    .setLabel("Collectible(s)");

const getExpressionBtn = (data: SpiritsData, value: string, t: ReturnType<typeof getTranslator>, icon: string): ButtonBuilder =>
  new ButtonBuilder()
    .setCustomId("spirit_expression" + `-${value}`)
    .setLabel(
      data.expression!.type === "Emote"
        ? t("commands:SPIRITS.RESPONSES.BUTTONS.EMOTE")
        : data.expression!.type === "Stance"
          ? t("commands:SPIRITS.RESPONSES.BUTTONS.STANCE")
          : data.expression!.type === "Call"
            ? t("commands:SPIRITS.RESPONSES.BUTTONS.CALL")
            : t("commands:SPIRITS.RESPONSES.BUTTONS.ACTION"),
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
  ) {}

  /**
   * Get the embed for the spirit response
   */
  public getEmbed(): EmbedBuilder {
    const data = this.data;
    const client = this.client;
    const icon = data.expression?.icon ?? data.icon ?? "<:spiritIcon:1206501060303130664>";
    const desc = `${this.t("commands:SPIRITS.RESPONSES.EMBED.TYPE", { SPIRIT_TYPE: data.type })}${
      data.realm
        ? `\n${this.t("commands:SPIRITS.RESPONSES.EMBED.REALM", { REALM: `${client.emojisMap.get("realms")![data.realm]} ${data.realm}` })}`
        : ""
    }${this.isSeasonal(data) && data.season ? `\n${this.t("commands:SPIRITS.RESPONSES.EMBED.SEASON", { SEASON: client.emojisMap.get("seasons")![data.season] + ` ${this.t("commands:GUIDES.RESPONSES.SPIRIT_SELECT_PLACEHOLDER", { SEASON: data.season })}` })}` : ""}`;
    const embed = new EmbedBuilder()
      .setTitle(`${icon} ${data.name}${data.extra ? ` (${data.extra})` : ""}`)
      .setURL(`https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}`)
      .setDescription(desc)
      .setAuthor({ name: this.t("commands:SPIRITS.RESPONSES.EMBED.AUTHOR") });
    if (data.image) embed.setThumbnail(data.image);
    if ("ts" in data && !data.current) {
      embed.addFields({
        name: this.t("commands:SPIRITS.RESPONSES.EMBED.FIELDS.SUMMARY_TITLE"),
        value: !data.ts.eligible
          ? `- ${this.t("commands:SPIRITS.RESPONSES.EMBED.FIELDS.SUMMARY_DESC_NO_ELIGIBLE", {
              SEASON:
                Object.values(seasonsData).find((v) => v.name === data.season)?.icon +
                ` **__${this.t("commands:GUIDES.RESPONSES.SPIRIT_SELECT_PLACEHOLDER", { SEASON: data.season })}__**`,
            })}`
          : data.ts.returned
            ? `${this.t("commands:SPIRITS.RESPONSES.EMBED.FIELDS.SUMMARY_DESC_RETURNED", { VISITS: data.ts.dates.length })}\n${this._formatDates(data.ts.dates)}`
            : `- ${this.t("commands:SPIRITS.RESPONSES.EMBED.FIELDS.SUMMARY_DESC_NO_VISIT")}`,
      });
    }

    if (!this.isSeasonal(data)) {
      embed.addFields({ name: this.t("commands:SPIRITS.RESPONSES.EMBED.CREDIT"), value: " " });
      embed.setImage(`${config.CDN_URL}/${data.main.image}`);
    } else {
      // For seasonal spirits
      embed.addFields({
        name: data.ts?.returned
          ? this.t("features:SPIRITS.TREE_TITLE", { CREDIT: data.tree!.by })
          : this.t("features:SPIRITS.SEASONAL_CHART", { CREDIT: data.tree!.by }),
        value: data
          .tree!.total.replaceAll(":RegularCandle:", "<:RegularCandle:1207793250895794226>")
          .replaceAll(":RegularHeart:", "<:regularHeart:1207793247792013474>")
          .replaceAll(":AC:", "<:AscendedCandle:1207793254301433926>"),
      });

      // Allow usage of both cdn link and direct link
      // TODO: Consider removing cdn as it is getting very expensive lol
      let url = data.tree?.image;
      if (!url?.startsWith("https://")) url = config.CDN_URL + "/" + url;
      embed.setImage(url);
    }
    return embed;
  }

  /**
   * Get the buttons for the spirit response
   */
  public getButtons(): ActionRowBuilder<ButtonBuilder> {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const data = this.data;
    const [value] = Object.entries(this.client.spiritsData).find(([, v]) => {
      if (v.extra) return data.extra === v.extra && data.name === v.name;
      return v.name === data.name;
    })!;
    if (this.isSeasonal(data) && data.location) row.addComponents(lctnBtn(value));

    if (data.expression) row.addComponents(getExpressionBtn(data, value, this.t, data.expression.icon));

    if (data.collectibles?.length) {
      row.addComponents(collectiblesBtn(data.collectibles[Math.floor(Math.random() * data.collectibles.length)].icon, value));
    }

    return row;
  }

  isSeasonal(data: SpiritsData): data is SeasonalSpiritData {
    return "ts" in data;
  }

  isRegular(data: SpiritsData): data is RegularSpiritData {
    return "ts" in data;
  }

  /**
   * Returns sorted visit dates in descending order
   * (Because my lazy ass put it in random order for some spirits)
   * @param dates Areay of visit datas
   */
  private _sortDates(dates: (string | string[])[]) {
    return dates.sort((a, b) => {
      const aDate = moment
        .tz((this._isArray(a) ? a[0] : a).replace(/\([^)]+\)/g, "").trim(), "MMMM DD, YYYY", "America/Los_Angeles")
        .startOf("day");
      const bDate = moment
        .tz((this._isArray(b) ? b[0] : b).replace(/\([^)]+\)/g, "").trim(), "MMMM DD, YYYY", "America/Los_Angeles")
        .startOf("day");
      if (aDate.isAfter(bDate)) return -1;
      else return 1;
    });
  }

  /**
   * Returns if given element is an array or not
   * @param element
   */
  private _isArray(element: string | string[]) {
    return Array.isArray(element);
  }

  /**
   * Formats the spirit's return dates in discord timestamp
   * @param dates
   */
  private _formatDates(dates: (string | string[])[]) {
    return this._sortDates(dates)
      .map((date) => {
        let index;
        // Check if the date is an array or a string
        // (it's array for special visits as their stay duration can be longer, 1st elemnt is the visit date and second their departure)
        const isArray = this._isArray(date);

        // Only first element should have the SV tag (if an array) so use that to get it
        const formatDate = (isArray ? date[0] : date)
          .replace(/\([^)]+\)/g, (match) => {
            index = match.trim().replaceAll("SV", "[SV](https://sky-children-of-the-light.fandom.com/wiki/Returning_Spirits)");
            return "";
          })
          .trim();
        const dateM = moment.tz(formatDate, "MMMM DD, YYYY", "America/Los_Angeles").startOf("day");

        // Use the 2nd element in the array as the end date, or add 3 days to the start date
        const dateE = isArray
          ? moment.tz(date[1], "MMMM DD, YYYY", "America/Los_Angeles").endOf("day")
          : dateM.clone().add(3, "days").endOf("day");
        return `- ${time(dateM.toDate())} - ${time(dateE.toDate())} ${index}`;
      })
      .join("\n");
  }
}
