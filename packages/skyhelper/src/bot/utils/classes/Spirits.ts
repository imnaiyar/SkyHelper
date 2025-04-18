import { seasonsData } from "@skyhelperbot/constants";
import type { SpiritsData, SeasonalSpiritData, RegularSpiritData } from "@skyhelperbot/constants/spirits-datas";
import type { SkyHelper } from "@/structures";
import config from "@/config";
import { getTranslator } from "@/i18n";
import { ButtonStyle, type APIActionRowComponent, type APIButtonComponent, type APIEmbed } from "@discordjs/core";
import utils from "./Utils.js";
import { DateTime } from "luxon";

// Define location Btn (Tree btn is defined/handled when location button is clicked)
const lctnBtn = (spirit: string, user: string): APIButtonComponent => ({
  type: 2,
  custom_id: utils.encodeCustomId({ id: "spirit_common", type: "location", spirit, user }),
  label: "Location",
  style: ButtonStyle.Secondary,
});

const collectiblesBtn = (icon: string, spirit: string, user: string): APIButtonComponent => ({
  type: 2,
  custom_id: utils.encodeCustomId({ id: "spirit_collectible", spirit, user }),
  emoji: utils.parseEmoji(icon)!,
  style: ButtonStyle.Success,
  label: "Collectible(s)",
});

const getExpressionBtn = (
  data: SpiritsData,
  spirit: string,
  t: ReturnType<typeof getTranslator>,
  icon: string,
  user: string,
): APIButtonComponent => ({
  type: 2,
  custom_id: utils.encodeCustomId({ id: "spirit_expression", spirit, user }),
  label:
    data.expression!.type === "Emote"
      ? t("commands:SPIRITS.RESPONSES.BUTTONS.EMOTE")
      : data.expression!.type === "Stance"
        ? t("commands:SPIRITS.RESPONSES.BUTTONS.STANCE")
        : data.expression!.type === "Call"
          ? t("commands:SPIRITS.RESPONSES.BUTTONS.CALL")
          : t("commands:SPIRITS.RESPONSES.BUTTONS.ACTION"),
  emoji: utils.parseEmoji(icon)!,
  style: ButtonStyle.Primary,
});

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
  public getEmbed(): APIEmbed {
    const data = this.data;
    const client = this.client;
    const icon = data.expression?.icon ?? data.icon ?? "<:spiritIcon:1206501060303130664>";
    const desc = `${this.t("commands:SPIRITS.RESPONSES.EMBED.TYPE", { SPIRIT_TYPE: data.type })}${
      data.realm
        ? `\n${this.t("commands:SPIRITS.RESPONSES.EMBED.REALM", { REALM: `${client.emojisMap.get("realms")![data.realm]} ${data.realm}` })}`
        : ""
    }${this.isSeasonal(data) && data.season ? `\n${this.t("commands:SPIRITS.RESPONSES.EMBED.SEASON", { SEASON: client.emojisMap.get("seasons")![data.season] + ` ${this.t("commands:GUIDES.RESPONSES.SPIRIT_SELECT_PLACEHOLDER", { SEASON: data.season })}` })}` : ""}`;

    const embed: APIEmbed = {
      title: `${icon} ${data.name}${data.extra ? ` (${data.extra})` : ""}`,
      url: `https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}`,
      description: desc,
      author: { name: this.t("commands:SPIRITS.RESPONSES.EMBED.AUTHOR") },
      thumbnail: data.image ? { url: data.image } : undefined,
      fields: [],
      image: undefined,
    };

    if ("ts" in data && !data.current) {
      embed.fields!.push({
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
      embed.fields!.push({ name: this.t("commands:SPIRITS.RESPONSES.EMBED.CREDIT"), value: " " });
      embed.image = { url: `${config.CDN_URL}/${data.main.image}` };
    } else {
      embed.fields!.push({
        name: data.ts?.returned
          ? this.t("features:SPIRITS.TREE_TITLE", { CREDIT: data.tree!.by })
          : this.t("features:SPIRITS.SEASONAL_CHART", { CREDIT: data.tree!.by }),
        value: data
          .tree!.total.replaceAll(":RegularCandle:", "<:RegularCandle:1207793250895794226>")
          .replaceAll(":RegularHeart:", "<:regularHeart:1207793247792013474>")
          .replaceAll(":AC:", "<:AscendedCandle:1207793254301433926>"),
      });

      let url = data.tree?.image;
      if (!url?.startsWith("https://")) url = config.CDN_URL + "/" + url;
      embed.image = { url };
    }

    return embed;
  }

  /**
   * Get the buttons for the spirit response
   */
  public getButtons(userid: string): APIActionRowComponent<APIButtonComponent> {
    const components: APIButtonComponent[] = [];
    const data = this.data;
    const [value] = Object.entries(this.client.spiritsData).find(([, v]) => {
      if (v.extra) return data.extra === v.extra && data.name === v.name;
      return v.name === data.name;
    })!;
    if (this.isSeasonal(data) && data.location) components.push(lctnBtn(value, userid));

    if (data.expression) components.push(getExpressionBtn(data, value, this.t, data.expression.icon, userid));

    if (data.collectibles?.length) {
      components.push(
        collectiblesBtn(data.collectibles[Math.floor(Math.random() * data.collectibles.length)].icon, value, userid),
      );
    }

    return {
      type: 1,
      components,
    };
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
      const aDate = DateTime.fromFormat((this._isArray(a) ? a[0] : a).replace(/\([^)]+\)/g, "").trim(), "LLLL dd, yyyy", {
        zone: "America/Los_Angeles",
      }).startOf("day");
      const bDate = DateTime.fromFormat((this._isArray(b) ? b[0] : b).replace(/\([^)]+\)/g, "").trim(), "LLLL dd, yyyy", {
        zone: "America/Los_Angeles",
      }).startOf("day");
      if (aDate > bDate) return -1;
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
        const dateM = DateTime.fromFormat(formatDate, "LLLL dd, yyyy", { zone: "America/Los_Angeles" }).startOf("day");

        // Use the 2nd element in the array as the end date, or add 3 days to the start date
        const dateE = isArray
          ? DateTime.fromFormat(date[1], "LLLL dd, yyyy", { zone: "America/Los_Angeles" }).endOf("day")
          : dateM.plus({ days: 3 }).endOf("day");
        return `- ${utils.time(dateM.toJSDate())} - ${utils.time(dateE.toJSDate())} ${index}`;
      })
      .join("\n");
  }
}
