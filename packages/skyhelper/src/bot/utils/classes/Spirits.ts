import type { SkyHelper } from "@/structures";
import { getTranslator } from "@/i18n";
import { ButtonStyle, type APIActionRowComponent, type APIButtonComponent } from "@discordjs/core";
import utils from "./Utils.js";
import { button, container, section, separator, textDisplay, thumbnail } from "@skyhelperbot/utils";
import { emojis } from "@skyhelperbot/constants";
import { CustomId } from "../customId-store.js";
import type { ResponseData } from "./InteractionUtil.js";
import type { RawFile } from "@discordjs/rest";
import { DisplayTabs } from "@/types/planner";
import {
  ItemType,
  SpiritTreeHelper,
  type ISkyData,
  type ISpecialVisitSpirit,
  type ISpirit,
  type ITravelingSpirit,
} from "skygame-data";
import { CostUtils, NonCollectibles, PlannerService } from "@/planner";
import generateSpiritTreeTier from "../image-generators/SpiritTreeTierRenderer.js";
import { generateSpiritTree } from "../image-generators/SpiritTreeRenderer.js";

const collectiblesBtn = (spirit: string, user: string, icon?: string): APIButtonComponent => ({
  type: 2,
  custom_id: utils.store.serialize(CustomId.SpiritCollectible, { spirit, user }),
  emoji: icon ? utils.parseEmoji(icon)! : undefined,
  style: ButtonStyle.Success,
  label: "Collectible(s)",
});

const getExpressionBtn = (data: ISpirit, user: string): APIButtonComponent => ({
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
  constructor(
    private data: ISpirit,
    private t: ReturnType<typeof getTranslator>,
    private client: SkyHelper,
    private plannerData: ISkyData,
  ) {}

  /**
   * Get the embed for the spirit response
   */
  public async getResponseEmbed(userid: string): Promise<ResponseData> {
    const data = this.data;
    const icon = utils.formatEmoji(data.emoji ?? "<:spiritIcon:1206501060303130664>", data.name);
    // Spirit type
    const description = [this.t("commands:SPIRITS.RESPONSES.EMBED.TYPE", { SPIRIT_TYPE: data.type })];

    // spirit realm
    const realm = this.plannerData.realms.items.find((r) =>
      PlannerService.getSpiritsInRealm(r.guid, this.plannerData).some((sp) => sp.guid === data.guid),
    );
    if (realm) description.push(this.t("commands:SPIRITS.RESPONSES.EMBED.REALM", { REALM: realm.name }));

    // if seasonal, then the season
    if (data.season) {
      description.push(utils.formatEmoji(data.season.emoji) + " " + data.season.name);
    }

    const headerTitle = `-# ${this.t("commands:SPIRITS.RESPONSES.EMBED.AUTHOR")}\n### [${icon} ${data.name}](https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")})`;

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
    if (data.travelingSpirits || data.specialVisitSpirits) {
      comp.components.push(
        separator(true, 1),
        textDisplay(
          `**${this.t("commands:SPIRITS.RESPONSES.EMBED.FIELDS.SUMMARY_TITLE")}**\n${
            data.travelingSpirits?.length || data.specialVisitSpirits?.length
              ? `${emojis.tree_middle}${this.t("commands:SPIRITS.RESPONSES.EMBED.FIELDS.SUMMARY_DESC_RETURNED", { VISITS: [...(data.travelingSpirits ?? []), ...(data.specialVisitSpirits ?? [])].length })}\n${emojis.tree_end}${this.t(
                  "commands:SPIRITS.RESPONSES.EMBED.FIELDS.SUMMARY_RETURNED_DATE",
                )}\n${this._formatDates([...(data.travelingSpirits ?? []), ...(data.specialVisitSpirits ?? [])])}`
              : `${emojis.tree_end}${this.t("commands:SPIRITS.RESPONSES.EMBED.FIELDS.SUMMARY_DESC_NO_VISIT")}`
          }`,
        ),
      );
    }
    comp.components.push(separator(true, 1));
    if (data.tree || data.specialVisitSpirits?.length || data.travelingSpirits?.length) {
      const visits = PlannerService.sortByDates(
        [...(data.travelingSpirits ?? []), ...(data.specialVisitSpirits ?? [])],
        ["visit"],
      );
      // priorotize the latest visit first to preserve the legacy behaviour
      const tree = visits[0]?.tree ?? data.tree;
      if (!tree) throw new Error("Something fell off");
      const options = { noOpacity: true, botName: "SkyHelper", botIcon: utils.getUserAvatar(this.client.user) };
      const image = await (tree.tier ? generateSpiritTreeTier(tree as any, options) : generateSpiritTree(tree as any, options));
      file = { data: image, name: "tree.png" };
      const costs = CostUtils.groupedToCostEmoji([tree]);
      comp.components.push(section(thumbnail(`attachment://tree.png`), emojis.right_chevron + "Spirit Tree\n" + costs));
    }
    const btns = this.getButtons(userid);
    if (btns) comp.components.push(separator(true, 1), btns);

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
  public getButtons(userid: string): APIActionRowComponent<APIButtonComponent> | null {
    const components: APIButtonComponent[] = [];
    const data = this.data;
    const items = SpiritTreeHelper.getItems(data.tree);
    const emoteNode = items.filter((i) => [ItemType.Stance, ItemType.Call, ItemType.Emote].includes(i.type));
    if (emoteNode.some((s) => s.previewUrl)) components.push(getExpressionBtn(data, userid));
    const collectibles = items.filter((i) => !NonCollectibles.includes(i.type));

    if (collectibles.length) {
      components.push(collectiblesBtn(data.guid, userid, collectibles[Math.floor(Math.random() * collectibles.length)]!.emoji));
    }
    if (!components.length) return null;

    return {
      type: 1,
      components,
    };
  }

  /**
   * Formats the spirit's return dates in discord timestamp
   * @param dates
   */
  private _formatDates(ts: Array<ITravelingSpirit | ISpecialVisitSpirit>) {
    return PlannerService.sortByDates(ts, ["visit"])
      .map((visit) => {
        const rr = "number" in visit ? visit : visit.visit;
        return `- ${utils.time(rr.date.toJSDate())} - ${utils.time(rr.endDate.toJSDate())} (${"number" in visit ? `#${visit.number}` : `SV`})`;
      })
      .join("\n");
  }
}
