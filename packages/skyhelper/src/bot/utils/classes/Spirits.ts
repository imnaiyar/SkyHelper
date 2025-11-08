import type { SpiritsData, SeasonalSpiritData, RegularSpiritData } from "@skyhelperbot/constants/spirits-datas";
import type { SkyHelper } from "@/structures";
import { getTranslator } from "@/i18n";
import { ButtonStyle, type APIActionRowComponent, type APIButtonComponent } from "@discordjs/core";
import utils from "./Utils.js";
import {
  button,
  container,
  generateSpiritTree,
  generateSpiritTreeTier,
  section,
  separator,
  textDisplay,
  thumbnail,
} from "@skyhelperbot/utils";
import { emojis } from "@skyhelperbot/constants";
import { CustomId } from "../customId-store.js";
import {
  CollectibleItems,
  formatGroupedCurrencies,
  getItemsInSpiritTree,
  getSpiritsInRealm,
  ItemType,
  resolveToLuxon,
  sortDates,
  type IReturningSpirit,
  type ISpirit,
  type ITravelingSpirit,
  type PlannerAssetData,
} from "@skyhelperbot/constants/skygame-planner";
import type { ResponseData } from "./InteractionUtil.js";
import type { RawFile } from "@discordjs/rest";
import { DisplayTabs } from "@/types/planner";

const collectiblesBtn = (icon: string, spirit: string, user: string): APIButtonComponent => ({
  type: 2,
  custom_id: utils.store.serialize(CustomId.SpiritCollectible, { spirit, user }),
  emoji: utils.parseEmoji(icon)!,
  style: ButtonStyle.Success,
  label: "Collectible(s)",
});

const getExpressionBtn = (data: ISpirit, t: ReturnType<typeof getTranslator>, user: string): APIButtonComponent => ({
  type: 2,
  custom_id: utils.store.serialize(CustomId.SpiritExpression, { spirit: data.guid, user }),
  label: "Expression",
  emoji: data.emoji ? utils.parseEmoji(data.emoji)! : undefined,
  style: ButtonStyle.Primary,
});

/**
 * Handle Spirit data and interactions
 */
export class Spirits {
  legacyData: SpiritsData | null = null;
  constructor(
    private data: ISpirit,
    private t: ReturnType<typeof getTranslator>,
    private client: SkyHelper,
    private plannerData: PlannerAssetData,
  ) {
    this.legacyData = Object.values(client.spiritsData).find((s) => s.name === data.name) ?? null;
  }

  /**
   * Get the embed for the spirit response
   */
  public async getResponseEmbed(userid: string): Promise<ResponseData> {
    const data = this.data;
    const icon = utils.formatEmoji(data.emoji ?? "<:spiritIcon:1206501060303130664>", data.name);
    // Spirit type
    const description = [this.t("commands:SPIRITS.RESPONSES.EMBED.TYPE", { SPIRIT_TYPE: data.type })];

    // spirit realm
    const realm = this.plannerData.realms.find((r) =>
      getSpiritsInRealm(r.guid, this.plannerData).some((sp) => sp.guid === data.guid),
    );
    if (realm) description.push(this.t("commands:SPIRITS.RESPONSES.EMBED.REALM", { REALM: realm.name }));

    // if seasonal, then the season
    if (data.season) {
      description.push(utils.formatEmoji(data.season.emoji) + " " + data.season.name);
    }

    const headerTitle = `-# ${this.t("commands:SPIRITS.RESPONSES.EMBED.AUTHOR")}\n### [${icon} ${data.name}${
      this.legacyData?.extra ? ` (${this.legacyData.extra})` : ""
    }](https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")})`;

    const comp = container(
      data.imageUrl ? section(thumbnail(data.imageUrl, data.name), headerTitle) : textDisplay(headerTitle),
      separator(true, 1),
      textDisplay(
        description
          .map((d, i, arr) => (i === 0 ? emojis.tree_top : i === arr.length - 1 ? emojis.tree_end : emojis.tree_middle) + d)
          .join("\n"),
      ),
    );
    let file: RawFile | undefined;
    if (data.ts || data.returns) {
      comp.components.push(
        separator(true, 1),
        textDisplay(
          `**${this.t("commands:SPIRITS.RESPONSES.EMBED.FIELDS.SUMMARY_TITLE")}**\n${
            data.ts?.length || data.returns?.length
              ? `${emojis.tree_middle}${this.t("commands:SPIRITS.RESPONSES.EMBED.FIELDS.SUMMARY_DESC_RETURNED", { VISITS: [...(data.ts ?? []), ...(data.returns ?? [])].length })}\n${emojis.tree_end}${this.t(
                  "commands:SPIRITS.RESPONSES.EMBED.FIELDS.SUMMARY_RETURNED_DATE",
                )}\n${this._formatDates([...(data.ts ?? []), ...(data.returns ?? [])])}`
              : `${emojis.tree_end}${this.t("commands:SPIRITS.RESPONSES.EMBED.FIELDS.SUMMARY_DESC_NO_VISIT")}`
          }`,
        ),
      );
    }
    comp.components.push(separator(true, 1));
    if (data.tree || data.returns?.length || data.ts?.length) {
      const visits = sortDates([...(data.ts ?? []), ...(data.returns ?? [])], ["return"]);
      // priorotize the latest visit first to preserve the legacy behaviour
      const tree = visits[0]?.tree ?? data.tree;
      if (!tree) throw new Error("Something fell off");
      const image = await (tree.tier
        ? generateSpiritTreeTier(tree as any, { noOpacity: true })
        : generateSpiritTree(tree as any, { noOpacity: true }));
      file = { data: image, name: "tree.png" };
      const costs = formatGroupedCurrencies([tree]);
      comp.components.push(section(thumbnail(`attachment://tree.png`), emojis.right_chevron + "Spirit Tree\n" + costs));
    }
    if (this.legacyData && "location" in this.legacyData) {
      let url = this.legacyData.location!.image;
      if (!url.startsWith("https://")) url = this.client.config.CDN_URL + "/" + url;
      comp.components.push(
        section(
          thumbnail(url),
          `${emojis.right_chevron} ${this.t("features:SPIRITS.LOCATION_TITLE", { CREDIT: this.legacyData.location!.by })}`,
          this.legacyData.location!.description ? `-# ${emojis.tree_end}${this.legacyData.location!.description}` : "",
        ),
      );
    }
    comp.components.push(separator(true, 1), this.getButtons(userid));

    return {
      components: [
        comp,
        section(
          button({
            custom_id: this.client.utils.store.serialize(this.client.utils.customId.PlannerTopLevelNav, {
              user: userid,
              t: DisplayTabs.Spirits,
              it: data.guid,
              i: null,
              p: null,
              back: null,
              r: null,
              // go through normal page
              d: "normal",
              f: null,
            }),
            label: "Planner",
          }),
          "See this spirit in Sky Planner?",
        ),
      ],
      files: file ? [file] : undefined,
    };
  }

  /**
   * Get the buttons for the spirit response
   */
  public getButtons(userid: string): APIActionRowComponent<APIButtonComponent> {
    const components: APIButtonComponent[] = [];
    const data = this.data;
    const items = getItemsInSpiritTree(data.guid, this.plannerData);
    const emoteNode = items.find((i) => [ItemType.Stance, ItemType.Call, ItemType.Emote].includes(i.type as ItemType));
    if (this.legacyData?.expression || emoteNode) components.push(getExpressionBtn(data, this.t, userid));
    const collectibles = items.filter((i) => CollectibleItems.includes(i.type as ItemType));
    if (this.legacyData?.collectibles?.length || collectibles.length) {
      components.push(
        collectiblesBtn(
          (this.legacyData?.collectibles?.length ? this.legacyData.collectibles : collectibles)[
            Math.floor(Math.random() * (this.legacyData?.collectibles?.length ?? collectibles.length))
          ]!.icon!,
          data.guid,
          userid,
        ),
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
   * Formats the spirit's return dates in discord timestamp
   * @param dates
   */
  private _formatDates(ts: Array<ITravelingSpirit | IReturningSpirit>) {
    return sortDates(ts, ["return"])
      .map((visit) => {
        const rr = "return" in visit ? visit.return : visit;
        const date = resolveToLuxon(rr.date);
        const end = resolveToLuxon(rr.endDate ?? date.plus({ days: 3 }));
        return `- ${utils.time(date.toJSDate())} - ${utils.time(end.toJSDate())} (${"return" in visit ? `SV` : `#${visit.number}`})`;
      })
      .join("\n");
  }
}
