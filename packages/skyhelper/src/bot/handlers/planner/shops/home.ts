import { BasePlannerHandler } from "../base.js";
import { serializeFilters } from "../filter.manager.js";
import { button, container, section, separator, textDisplay } from "@skyhelperbot/utils";
import { getIGCnIApDisplay } from "./shared.js";
import { FilterType } from "@/types/planner";
import type { IItemList } from "skygame-data";
import type { IIAP } from "skygame-data";
import type { IShop } from "skygame-data";
/** Configs for permanent shops */
const configs = (planner: BasePlannerHandler): Array<{ title: string; description: string; custom_id: string }> => [
  {
    title: "Aviary Event Store",
    description:
      "The Aviary Event Store was introduced in the Season of Revival. The building can be accessed through Aviary Village.",
    custom_id: planner.createCustomId({
      d: "shops",
      f: serializeFilters(
        new Map([
          [FilterType.Shops, planner.data.shops.items.filter((s) => s.permanent === "event").map((s) => s.guid)],
          [FilterType.SpiritTrees, ["TbheKd0E45"]],
        ]),
      ),
    }),
  },
  {
    title: "Nesting Workshop",
    description:
      "The Nesting Workshop was introduced in the Season of Nesting. The building can be accessed through Aviary Village.",
    custom_id: planner.createCustomId({ d: "nesting" }),
  },
  {
    title: "Concert Halls",
    description: "Concert Hall was introduced in the Season of Duets. The hall can be accessed through Aviary Village.",
    custom_id: planner.createCustomId({
      d: "shops",
      f: serializeFilters(new Map([[FilterType.SpiritTrees, ["4uhy67a14a"]]])),
    }),
  },
  {
    title: "Cinema",
    description:
      "The Cinema was introduced in the Season of Two Embers - Part One. The place can be accessed through the collaboration room accessed from Aviary Village. ",
    custom_id: planner.createCustomId({
      d: "shops",
      f: serializeFilters(
        new Map([[FilterType.Shops, planner.data.shops.items.filter((s) => s.permanent === "cinema").map((s) => s.guid)]]),
      ),
    }),
  },
  {
    title: "Harmony Hall",
    description:
      "Harmony Hall was introduced in the Season of Performance. The building can be accessed through Aviary Village, the Village of Dreams and the Village Theatre.",
    custom_id: planner.createCustomId({
      d: "shops",
      f: serializeFilters(
        new Map([
          [FilterType.Shops, planner.data.shops.items.filter((s) => s.permanent === "harmony").map((s) => s.guid)],
          [FilterType.SpiritTrees, ["bkdgyeUcbZ"]],
        ]),
      ),
    }),
  },
  {
    title: "Secret Area",
    description:
      "The Secret Area is only available with a certain cape or during some events. The location can be accessed through the Vault of Knowledge.",
    custom_id: planner.createCustomId({
      d: "shops",
      f: serializeFilters(
        new Map([[FilterType.Shops, planner.data.shops.items.filter((s) => s.permanent === "office").map((s) => s.guid)]]),
      ),
    }),
  },
];
export class ShopHomeDisplay extends BasePlannerHandler {
  igcs: IItemList[] = [];
  iaps: IIAP[] = [];
  shops: IShop[] = [];
  loadData() {
    this.shops = this.data.shops.items.filter((s) => s.permanent === true);

    for (const shop of this.shops) {
      if (shop.itemList) this.igcs.push(shop.itemList);
      if (shop.iaps) this.iaps.push(...shop.iaps);
    }
  }
  override handle() {
    this.loadData();
    return { components: [container(this.display())] };
  }

  display() {
    const storeconfigs = configs(this);
    return [
      textDisplay("# Permanent Shops", "These shops are available all year round."),
      separator(),
      ...storeconfigs.map((c) =>
        section(button({ custom_id: c.custom_id, label: "View Store", style: 1 }), `### ${c.title}`, c.description),
      ),
      separator(),
      ...this.displayPaginatedList({
        perpage: 3,
        page: this.state.p ?? 1,
        user: this.state.user,
        items: [
          this.igcs.length
            ? [
                textDisplay(`## In-Game Currency (IGC) (${this.igcs.length})`),
                this.igcs.flatMap((igc) => getIGCnIApDisplay(igc, this, "igc")),
              ]
            : null,
          this.iaps.length
            ? [
                textDisplay(`## In-App Purchases (IAP) (${this.iaps.length})`),
                this.iaps.flatMap((iap) => getIGCnIApDisplay(iap, this, "iap")),
              ]
            : null,
        ]
          .filter((s) => !!s)
          .flat(),
        itemCallback: (i) => (Array.isArray(i) ? i : [i]),
      }),
    ];
  }
}
