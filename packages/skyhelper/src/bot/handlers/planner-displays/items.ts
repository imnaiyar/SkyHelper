import { getNodeSpirit, ItemType, type IItem, PlannerDataHelper } from "@skyhelperbot/constants/skygame-planner";
import { BasePlannerHandler } from "./base.js";
import { button, container, mediaGallery, mediaGalleryItem, row, section, separator, textDisplay } from "@skyhelperbot/utils";

import type { APIComponentInContainer } from "discord-api-types/v10";
import { DisplayTabs, FilterType, PlannerAction } from "@/types/planner";
import { emojis } from "@skyhelperbot/constants";
import { createActionId } from "../planner-utils.js";

export class ItemsDisplay extends BasePlannerHandler {
  constructor(data: any, planner: any, state: any, settings: any, client: any) {
    super(data, planner, state, settings, client);
    this.initializeFilters([FilterType.ItemTypes, FilterType.Seasons, FilterType.Order, FilterType.Currencies], {
      [FilterType.ItemTypes]: { defaultValues: [ItemType.Outfit] },
    });
  }

  override handle() {
    if (this.state.it) {
      const item = this.data.items.find((i) => i.guid === this.state.it);
      if (!item) throw new Error("Invalid item");
      return { components: [container(this.itemDisplay(item))] };
    }
    let items = this.data.items;

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
  private getItemSourceNavigation(item: IItem) {
    const highlight = [FilterType.Highlight, [item.guid]] satisfies [FilterType.Highlight, string[]];
    // Check if item comes from a spirit tree
    const nodeWithSpirit = item.nodes?.find((n) => getNodeSpirit(n));
    if (nodeWithSpirit) {
      const spirit = getNodeSpirit(nodeWithSpirit)!;
      const tree = nodeWithSpirit.root!.spiritTree!;

      // Find which tree index this is for the spirit
      const allTrees = [spirit.tree, ...(spirit.treeRevisions ?? []), ...(spirit.returns ?? []), ...(spirit.ts ?? [])].filter(
        Boolean,
      );
      const treeIndex = allTrees.findIndex((t) => t?.guid === tree.guid);

      return this.createCustomId({
        t: DisplayTabs.Spirits,
        it: spirit.guid,
        i: treeIndex >= 0 ? `tree${treeIndex}` : undefined,
        f: this.filterManager?.serializeFilters(new Map([highlight])),
        b: { t: DisplayTabs.Items, it: item.guid, f: "" },
      });
    }

    // Check if item comes from a shop's item list
    const listNodeWithShop = item.listNodes?.find((ls) => ls.itemList.shop);
    if (listNodeWithShop?.itemList.shop) {
      const shop = listNodeWithShop.itemList.shop;
      return this.createCustomId({
        t: DisplayTabs.Shops,
        d: "shops",
        i: "shpstore",
        f: this.filterManager?.serializeFilters(new Map([[FilterType.Shops, [shop.guid]], highlight])),
        b: { t: DisplayTabs.Items, it: item.guid, f: null },
      });
    }

    // Check if item comes from an IAP
    const iap = item.iaps?.find((ia) => ia.shop);
    if (iap?.shop) {
      return this.createCustomId({
        t: DisplayTabs.Shops,
        d: "shops",
        i: "shpiap",
        f: this.filterManager?.serializeFilters(new Map([[FilterType.Shops, [iap.shop.guid]], highlight])),
        b: { t: DisplayTabs.Items, it: item.guid, f: null },
      });
    }

    return null;
  }

  itemslist(items: IItem[]) {
    return this.displayPaginatedList({
      items,
      page: this.state.p ?? 1,
      perpage: 7,
      user: this.state.user,
      itemCallback: (item) => {
        const isFavorited = PlannerDataHelper.hasGuid(this.settings.plannerData?.favourites ?? "", item.guid);
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
              item.nodes?.map(getNodeSpirit).find(Boolean)?.name,
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
    const isFavorited = PlannerDataHelper.hasGuid(this.settings.plannerData?.favourites ?? "", item.guid);

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
          isFavorited ? `⭐ **Favorited**` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      ),
      row(
        (() => {
          const sourceNav = this.getItemSourceNavigation(item);
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
        ? mediaGallery(mediaGalleryItem(this.planner.resolvePlannerUrl(item.previewUrl), { description: item.name }))
        : null,
      this.state.f === "dye"
        ? mediaGallery(
            [item.dye?.previewUrl, item.dye?.infoUrl]
              .filter(Boolean)
              .map((url) => mediaGalleryItem(this.planner.resolvePlannerUrl(url!), { description: item.name })),
          )
        : null,
    ]
      .flat()
      .filter(Boolean) as APIComponentInContainer[];
  }
}
