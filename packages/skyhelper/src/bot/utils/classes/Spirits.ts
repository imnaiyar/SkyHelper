import { season_emojis, seasonsData } from "@skyhelperbot/constants";
import type { SpiritsData, SeasonalSpiritData, RegularSpiritData } from "@skyhelperbot/constants/spirits-datas";
import type { SkyHelper } from "@/structures";
import config from "@/config";
import { getTranslator } from "@/i18n";
import { ButtonStyle, type APIActionRowComponent, type APIButtonComponent, type APIContainerComponent } from "@discordjs/core";
import utils from "./Utils.js";
import { DateTime } from "luxon";
import { container, section, separator, textDisplay, thumbnail } from "@skyhelperbot/utils";
import { emojis } from "@skyhelperbot/constants";
import { CustomId } from "../customId-store.js";

const collectiblesBtn = (icon: string, spirit: string, user: string): APIButtonComponent => ({
  type: 2,
  custom_id: utils.store.serialize(CustomId.SpiritCollectible, { spirit, user }),
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
  custom_id: utils.store.serialize(CustomId.SpiritExpression, { spirit, user }),
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
  public getResponseEmbed(userid: string): APIContainerComponent {
    const data = this.data;
    const icon = data.expression?.icon ?? data.icon ?? "<:spiritIcon:1206501060303130664>";
    // Spirit type
    const description = [this.t("commands:SPIRITS.RESPONSES.EMBED.TYPE", { SPIRIT_TYPE: data.type })];

    // spirit realm
    if (data.realm) description.push(this.t("commands:SPIRITS.RESPONSES.EMBED.REALM", { REALM: data.realm }));

    // if seasonal, then the season
    if (this.isSeasonal(data) && data.season) {
      description.push(
        season_emojis[data.season] + ` ${this.t("commands:GUIDES.RESPONSES.SPIRIT_SELECT_PLACEHOLDER", { SEASON: data.season })}`,
      );
    }

    const headerTitle = `-# ${this.t("commands:SPIRITS.RESPONSES.EMBED.AUTHOR")}\n### [${icon} ${data.name}${
      data.extra ? ` (${data.extra})` : ""
    }](https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")})`;

    const comp = container(
      data.image ? section(thumbnail(data.image, data.name), headerTitle) : textDisplay(headerTitle),
      separator(true, 1),
      textDisplay(
        description
          .map((d, i, arr) => (i === 0 ? emojis.tree_top : i === arr.length - 1 ? emojis.tree_end : emojis.tree_middle) + d)
          .join("\n"),
      ),
    );

    if ("ts" in data && !data.current) {
      comp.components.push(
        separator(true, 1),
        textDisplay(
          `**${this.t("commands:SPIRITS.RESPONSES.EMBED.FIELDS.SUMMARY_TITLE")}**\n${
            !data.ts.eligible
              ? `${emojis.tree_end}${this.t("commands:SPIRITS.RESPONSES.EMBED.FIELDS.SUMMARY_DESC_NO_ELIGIBLE", {
                  SEASON:
                    Object.values(seasonsData).find((v) => v.name === data.season)?.icon +
                    ` **__${this.t("commands:GUIDES.RESPONSES.SPIRIT_SELECT_PLACEHOLDER", { SEASON: data.season })}__**`,
                })}`
              : data.ts.returned
                ? `${emojis.tree_middle}${this.t("commands:SPIRITS.RESPONSES.EMBED.FIELDS.SUMMARY_DESC_RETURNED", { VISITS: data.ts.dates.length })}\n${emojis.tree_end}${this.t(
                    "commands:SPIRITS.RESPONSES.EMBED.FIELDS.SUMMARY_RETURNED_DATE",
                  )}\n${this._formatDates(data.ts.dates)}`
                : `${emojis.tree_end}${this.t("commands:SPIRITS.RESPONSES.EMBED.FIELDS.SUMMARY_DESC_NO_VISIT")}`
          }`,
        ),
      );
    }
    comp.components.push(separator(true, 1));

    if (!this.isSeasonal(data)) {
      comp.components.push(
        section(thumbnail(`${config.CDN_URL}/${data.main.image}`), this.t("commands:SPIRITS.RESPONSES.EMBED.CREDIT")),
      );
    } else {
      let url = data.tree?.image;
      if (!url?.startsWith("https://")) url = config.CDN_URL + "/" + url;
      if (url) {
        const totalCosts = data
          .tree!.total.replaceAll(":RegularCandle:", "<:RegularCandle:1207793250895794226>")
          .replaceAll(":RegularHeart:", "<:regularHeart:1207793247792013474>")
          .replaceAll(":AC:", "<:AscendedCandle:1207793254301433926>")
          .trim();
        comp.components.push(
          section(
            thumbnail(url),
            emojis.right_chevron +
              " " +
              (data.ts?.returned
                ? this.t("features:SPIRITS.TREE_TITLE", { CREDIT: data.tree!.by })
                : this.t("features:SPIRITS.SEASONAL_CHART", { CREDIT: data.tree!.by })),
            totalCosts ? `-# ${totalCosts}` : "",
          ),
        );
      }
    }
    if ("location" in data) {
      let url = data.location!.image;
      if (!url.startsWith("https://")) url = this.client.config.CDN_URL + "/" + url;
      comp.components.push(
        section(
          thumbnail(url),
          `${emojis.right_chevron} ${this.t("features:SPIRITS.LOCATION_TITLE", { CREDIT: data.location!.by })}`,
          data.location!.description ? `-# ${emojis.tree_end}${data.location!.description}` : "",
        ),
      );
    }
    comp.components.push(separator(true, 1), this.getButtons(userid));

    return comp;
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
  private _sortDates(dates: Array<string | string[]>) {
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
  private _formatDates(dates: Array<string | string[]>) {
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
