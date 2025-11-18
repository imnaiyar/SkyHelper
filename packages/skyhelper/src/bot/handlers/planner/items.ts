import { BasePlannerHandler } from "./base.js";
import { button, container, mediaGallery, mediaGalleryItem, row, section, separator, textDisplay } from "@skyhelperbot/utils";

import type { _NonNullableFields, _Nullable, APIComponentInContainer } from "discord-api-types/v10";
import { DisplayTabs, FilterType, PlannerAction, type NavigationState } from "@/types/planner";
import { emojis } from "@skyhelperbot/constants";
import { createActionId } from "./helpers/action.utils.js";
import { serializeFilters } from "./filter.manager.js";
import { ItemType, type IItem } from "skygame-data";
import { PlannerService } from "./helpers/planner.service.js";
import { PlannerDataService } from "./helpers/data.service.js";
import { resolvePlannerUrl } from "./fetcher.js";

export class ItemsDisplay extends BasePlannerHandler {
  constructor(data: any, state: any, settings: any, client: any) {
    super(data, state, settings, client);
    this.initializeFilters([FilterType.ItemTypes, FilterType.Seasons, FilterType.Order, FilterType.Currencies], {
      [FilterType.ItemTypes]: { defaultValues: [ItemType.Outfit] },
    });
  }

  override handle() {
    if (this.state.it) {
      const item = this.data.items.items.find((i) => i.guid === this.state.it);
      if (!item) throw new Error("Invalid item");
      return { components: [container(this.itemDisplay(item))] };
    }
    let items = this.data.items.items;

    // Apply additional filters if filter manager is available and has filters
    if (this.filterManager && this.hasActiveFilters()) {
      items = this.filterManager.filterItems(items);
    }

    return {
      components: [
        container(
          textDisplay("# Items", this.createFilterIndicator() ?? ""),
          this.createItemsNav(),
          separator(),
          ...this.itemslist(items),
        ),
      ],
    };
  }
  createItemsNav() {
    return row(this.createFilterButton("Filter"), this.homebtn());
  }

  /**
   * Creates a navigation state for viewing the source of an item
   * @param item The item to find the source for
   * @returns NavigationState to navigate to the source, or null if no source found
   */
  static getItemSourceNavigation(
    item: IItem,
    idGen: (opt: Partial<_Nullable<NavigationState>>) => string,
    b?: NavigationState["b"],
  ) {
    const highlight = [FilterType.Highlight, [item.guid]] satisfies [FilterType.Highlight, string[]];

    const getTimestamp = (dateStr?: string | { day: number; month: number; year: number }): number => {
      if (!dateStr) return 0;
      if (typeof dateStr === "string") {
        return new Date(dateStr).getTime();
      }
      return new Date(dateStr.year, dateStr.month - 1, dateStr.day).getTime();
    };

    // Collect all possible sources with their dates
    const sources: Array<{ type: string; date: number; nav: () => string }> = [];

    // Collect spirit tree sources
    item.nodes?.forEach((n) => {
      const spirit = PlannerService.getNodeSpirit(n);
      if (!spirit) return;

      const tree = n.root!.spiritTree!;
      const allTrees = [spirit.tree, ...(spirit.treeRevisions ?? []), ...(spirit.visits ?? []), ...(spirit.ts ?? [])].filter(
        Boolean,
      );
      const treeIndex = allTrees.findIndex((t) => t?.guid === tree.guid);

      // Determine the date based on tree type
      let date = 0;
      if (tree.ts) {
        date = getTimestamp(tree.ts.date);
      } else if (tree.visit) {
        date = getTimestamp(tree.visit.visit.date);
      } else if (tree.eventInstanceSpirit?.eventInstance) {
        date = getTimestamp(tree.eventInstanceSpirit.eventInstance.date);
      } else if (spirit.season) {
        date = getTimestamp(spirit.season.date);
      }

      sources.push({
        type: "spirit",
        date,
        nav: () =>
          idGen({
            t: DisplayTabs.Spirits,
            it: spirit.guid,
            i: treeIndex >= 0 ? `tree${treeIndex}` : undefined,
            f: serializeFilters(new Map([highlight])),
            b,
          }),
      });
    });

    // Collect shop item list sources
    item.listNodes?.forEach((ls) => {
      if (!ls.itemList.shop) return;
      const shop = ls.itemList.shop;
      const date = getTimestamp(shop.date);

      sources.push({
        type: "shop_list",
        date,
        nav: () =>
          idGen({
            t: DisplayTabs.Shops,
            d: "shops",
            i: "shpstore",
            f: serializeFilters(new Map([[FilterType.Shops, [shop.guid]], highlight])),
            b,
          }),
      });
    });

    // Collect IAP sources
    item.iaps?.forEach((iap) => {
      if (!iap.shop) return;
      const date = getTimestamp(iap.shop.date);

      sources.push({
        type: "iap",
        date,
        nav: () =>
          idGen({
            t: DisplayTabs.Shops,
            d: "shops",
            i: "shpiap",
            f: serializeFilters(new Map([[FilterType.Shops, [iap.shop!.guid]], highlight])),
            b,
          }),
      });
    });

    // Sort by date (most recent first) and return the first available source
    sources.sort((a, bb) => bb.date - a.date);

    return sources.length > 0 ? sources[0]!.nav() : null;
  }

  itemslist(items: IItem[]) {
    return this.displayPaginatedList({
      items,
      page: this.state.p ?? 1,
      perpage: 7,
      user: this.state.user,
      itemCallback: (item) => {
        const isFavorited = PlannerDataService.hasGuid(this.settings.plannerData?.favourites ?? "", item.guid);
        return [
          section(
            button({
              label: "View",
              custom_id: this.createCustomId({
                it: item.guid,
                /** filter can be too long sometimes to be passed, bummer */
                b: { t: this.state.t, f: "", p: 1 },
              }),
              style: 1,
            }),
            `## ${this.formatemoji(item.emoji, item.name)} ${item.name}` +
              (item.unlocked ? ` ${this.formatemoji(emojis.checkmark)}` : "") +
              (isFavorited ? ` ⭐` : ""),
            [
              item.group,
              // eslint-disable-next-line @typescript-eslint/unbound-method
              item.nodes?.map(PlannerService.getNodeSpirit).find(Boolean)?.name,
              item.nodes?.[0]?.root?.spiritTree?.eventInstanceSpirit?.eventInstance?.name,
              item.season?.shortName,
            ]
              .filter((s) => !!s)
              .join(" \u2022 "),
          ),
        ];
      },
    });
  }
  itemDisplay(item: IItem) {
    const isFavorited = PlannerDataService.hasGuid(this.settings.plannerData?.favourites ?? "", item.guid);

    return [
      section(
        this.state.b ? this.backbtn(this.createCustomId({ it: null, f: null, ...this.state.b })) : this.homebtn(), // fallback to item home
        `# ${this.formatemoji(item.emoji, item.name)} ${item.name}${item.level ? ` (Lvl ${item.level})` : ""}`,
        [`Type: ${item.type}`, item.subtype ? `Subtype: ${item.subtype}` : null, item.group ? `Group: ${item.group}` : null]
          .filter(Boolean)
          .join(" \u2022 "),
        [
          item.group === "Ultimate" ? "- This is a season's ultimate item and may not return in the future." : "",
          item.group === "Limited" ? "- This is a limited item and may not return in the future." : "",
          item.group === "SeasonPass" ? "- This item was offered with season pass." : "",
          item.unlocked ? `**Unlocked** ${this.formatemoji(emojis.checkmark)}` : "",
          isFavorited
            ? `⭐ **Favorited**${!item.unlocked && !item.autoUnlocked ? ": We will remind you if this item is available for purchase again!" : ""}`
            : "",
        ]
          .filter(Boolean)
          .join("\n"),
      ),
      row(
        (() => {
          const sourceNav = ItemsDisplay.getItemSourceNavigation(item, this.createCustomId.bind(this), {
            t: DisplayTabs.Items,
            it: item.guid,
            f: null,
          });
          // eslint-disable-next-line
          return this.viewbtn(sourceNav || "disabled-find-source", {
            label: "Find Source",
            disabled: !sourceNav,
          });
        })(),
        button({
          custom_id: createActionId({
            action: PlannerAction.ToggleFavorite,
            guid: item.guid,
            navState: this.state,
          }),
          label: isFavorited ? "Remove from Wishlist" : "Add to Wishlist",
          style: isFavorited ? 4 : 2,
          emoji: { name: "⭐" },
        }),
      ),
      separator(true, 1),
      item.dye
        ? row(
            this.viewbtn(this.createCustomId({ f: "preview" }), {
              label: "Preview",
              style: (this.state.f ?? "preview") === "preview" ? 2 : 3,
              disabled: (this.state.f ?? "preview") === "preview",
            }),
            this.viewbtn(this.createCustomId({ f: "dye" }), {
              label: "Dye Preview",
              style: this.state.f === "dye" ? 2 : 3,
              disabled: this.state.f === "dye",
            }),
          )
        : null,
      item.previewUrl && (this.state.f ?? "preview") === "preview"
        ? mediaGallery(mediaGalleryItem(resolvePlannerUrl(item.previewUrl), { description: item.name }))
        : null,
      this.state.f === "dye"
        ? mediaGallery(
            [item.dye?.previewUrl, item.dye?.infoUrl]
              .filter(Boolean)
              .map((url) => mediaGalleryItem(resolvePlannerUrl(url!), { description: item.name })),
          )
        : null,
    ]
      .flat()
      .filter(Boolean) as APIComponentInContainer[];
  }
}
