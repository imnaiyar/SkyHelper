import { button, container, row, separator, textDisplay } from "@skyhelperbot/utils";
import { BasePlannerHandler } from "../base.js";
import { emojis } from "@skyhelperbot/constants";
import { ComponentType, type APIComponentInContainer } from "discord-api-types/v10";
import { getIGCnIApDisplay } from "./shared.js";
import { spiritTreeDisplay } from "../shared.js";
import type { RawFile } from "@discordjs/rest";
import { FilterType } from "@/types/planner";
import type { IItemList, IShop, ISpiritTree } from "skygame-data";
import type { IIAP } from "skygame-data";
const name_mappings = {
  event: "Aviary Event",
  harmony: "Harmony Hall",
  office: "Secret Area (Office",
};

// NOTE!: Remember to not use `d` for shop routes, it is  used to reroute to permanent shops
export class ShopsDisplay extends BasePlannerHandler {
  igcs: IItemList[] = [];
  iaps: IIAP[] = [];
  shops: IShop[] = [];
  trees: ISpiritTree[] = [];
  menu: "store" | "iap" | "trees" | null = null;
  highlights: string[] = [];
  constructor(data: any, state: any, settings: any, client: any) {
    super(data, state, settings, client);
    this.initializeFilters([FilterType.Shops, FilterType.SpiritTrees, FilterType.Highlight]);
  }
  override async handle() {
    this.initializeShopData();

    const shop = this.shops[0]; // only used for names and location

    const components: APIComponentInContainer[] = [
      textDisplay(
        `# ${shop ? this.getshopname(shop) : "Concert Hall" /* This will only happen for Concert hall shop, at least for now */}`,
        `${this.formatemoji(emojis.location, "Location")} ${shop ? this.getshoplocation(shop) : "Aviary Village" /* Same */}`,
      ),
      separator(),
      ...this.getfilterrow(),
      textDisplay(
        this.menu === "store"
          ? "In-game Currency (IGC)" + ` (${this.igcs.length})`
          : "In-App Purchases" + ` (${this.iaps.length})`,
      ),
    ];
    let files: RawFile[] | undefined = undefined;
    switch (this.menu) {
      case "store":
      case "iap":
      default:
        components.push(...this.getItemsListDisplay());
        break;
      case "trees": {
        const display = await this.treeDisplay();
        files = display.files;
        components.push(...display.components);
        break;
      }
    }

    return { files, components: [container(components)] };
  }

  initializeShopData() {
    if (this.state.i?.startsWith("shp")) this.menu = (this.state.i.substring(3) as any) ?? "store";

    const shopIds = this.filterManager?.getFilterValues(FilterType.Shops) ?? [];

    const treeIds = this.filterManager?.getFilterValues(FilterType.SpiritTrees) ?? [];

    this.highlights = this.filterManager?.getFilterValues(FilterType.Highlight) ?? [];

    if (!shopIds.length && !treeIds.length) throw new Error("No shop or trees specified");

    this.shops = this.data.shops.items.filter((s) => shopIds.includes(s.guid));
    for (const shop of this.shops) {
      if (shop.itemList) this.igcs.push(shop.itemList);
      if (shop.iaps) this.iaps.push(...shop.iaps);
    }

    this.trees = this.data.spiritTrees.items.filter((t) => treeIds.includes(t.guid));

    if (this.igcs.length) {
      this.menu ??= "store";
    } else if (this.iaps.length) {
      this.menu ??= "iap";
    } else if (this.trees.length) {
      this.menu ??= "trees";
    } else {
      this.menu ??= "store";
    }
  }

  private getshopname(shop: IShop) {
    if (shop.permanent) return (name_mappings as Record<string, string>)[shop.permanent as any] ?? "Permanent Shop";
    if (shop.name) return shop.name;
    if (shop.event) return `${shop.event.event.name} Shop`;
    if (shop.season) return `${shop.season.name} Shop`;
    return "Shop";
  }

  private getshoplocation(shop: IShop) {
    return shop.name ?? (shop.type === "Store" ? "Premium Candle Store" : (shop.spirit?.name ?? "Unknown"));
  }

  private getfilterrow() {
    const comps = [];
    if (this.igcs.length) {
      comps.push(
        button({
          custom_id: this.createCustomId({ i: "shpstore" }),
          label: "In-Game Currency (IGC)",
          style: this.menu === "store" ? 3 : 2,
          disabled: this.menu === "store",
        }),
      );
    }

    if (this.iaps.length) {
      comps.push(
        button({
          custom_id: this.createCustomId({ i: "shpiap" }),
          label: "In-App Purchases (IAP)",
          style: this.menu === "iap" ? 3 : 2,
          disabled: this.menu === "iap",
        }),
      );
    }
    if (this.trees.length) {
      comps.push(
        button({
          custom_id: this.createCustomId({ i: "shptrees" }),
          label: "Spirit Tree(s)",
          style: this.menu === "trees" ? 3 : 2,
          disabled: this.menu === "trees",
        }),
      );
    }
    return [
      comps.length ? row(comps) : null,
      row(this.backbtn(this.createCustomId({ it: null, f: null, d: null, p: 1, ...this.state.b, b: null }))),
      separator(true, 1),
    ].filter((c) => !!c);
  }

  getItemsListDisplay() {
    return this.displayPaginatedList<APIComponentInContainer | APIComponentInContainer[]>({
      items:
        this.menu === "store"
          ? this.igcs.flatMap((i) =>
              getIGCnIApDisplay(
                i,
                this,
                "igc",
                this.highlights.includes(i.guid) || this.highlights.some((h) => i.items.some((it) => it.guid === h)),
              ),
            )
          : this.iaps.map((as) =>
              getIGCnIApDisplay(
                as,
                this,
                "iap",
                this.highlights.includes(as.guid) || this.highlights.some((h) => as.items?.some((it) => it.guid === h)),
              ),
            ),
      perpage: 5,

      page: this.state.p ?? 1,
      user: this.state.user,
      itemCallback: (as) => (Array.isArray(as) ? as : [as]),
    });
  }

  private async treeDisplay() {
    const current = this.trees.find((t) => t.guid === this.state.v?.[0]) ?? this.trees[0]!;
    const rows = row({
      type: ComponentType.StringSelect,
      custom_id: this.createCustomId({}),
      options: this.trees.map((t) => ({
        label: t.name ?? t.spirit?.name ?? t.eventInstanceSpirit?.name ?? "Unknown",
        value: t.guid,
        emoji: t.spirit?.emoji
          ? { id: t.spirit.emoji }
          : t.eventInstanceSpirit?.spirit.emoji
            ? { id: t.eventInstanceSpirit.spirit.emoji }
            : undefined,
        default: t.guid === current.guid,
      })),
    });
    const { file, components } = await spiritTreeDisplay({ tree: current, planner: this });
    return { files: [file], components: [this.trees.length > 1 ? rows : null, ...components].filter((c) => !!c) };
  }
}
