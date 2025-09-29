import { ItemType, type IItem } from "@skyhelperbot/constants/skygame-planner";
import { BasePlannerHandler, DisplayTabs } from "./base.js";
import { FilterType, serializeFilters } from "./filter.manager.js";
import { button, container, mediaGallery, mediaGalleryItem, row, section, separator, textDisplay } from "@skyhelperbot/utils";
import { emojis } from "@skyhelperbot/constants";
import type { APIComponentInContainer } from "discord-api-types/v10";

export class ItemsDisplay extends BasePlannerHandler {
  constructor(data: any, planner: any, state: any) {
    // pass default if not set, only if an item is not selected
    if (!state.item) state.filter ??= serializeFilters({ [FilterType.ItemTypes]: [ItemType.Outfit] });
    super(data, planner, state);
    // Initialize filters for items display
    this.initializeFilters([FilterType.ItemTypes, FilterType.Seasons, FilterType.Order]);
  }

  override handle() {
    if (this.state.item) {
      const item = this.data.items.find((i) => i.guid === this.state.item);
      if (!item) throw new Error("Invalid item");
      return { components: [container(this.itemDisplay(item))] };
    }
    let items = this.data.items;

    // Apply additional filters if filter manager is available and has filters
    if (this.filterManager && this.hasActiveFilters()) {
      items = this.filterManager.filterItems(items);
    }

    return {
      components: [container(this.createItemsNav(), textDisplay(this.createFilterIndicator()!), ...this.itemslist(items))],
    };
  }
  createItemsNav() {
    return [/* ...this.createTopCategoryRow(DisplayTabs.Items), */ row(this.createFilterButton("Filter"))];
  }
  itemslist(items: IItem[]) {
    return this.displayPaginatedList({
      items,
      page: this.state.page ?? 1,
      perpage: 5,
      user: this.state.user,
      itemCallback: (item) => [
        section(
          button({
            label: "View",
            custom_id: this.createCustomId({
              item: item.guid,
              back: { tab: this.state.tab, filter: this.state.filter, page: this.state.page ?? 1 },
            }),
            style: 1,
          }),
          `## ${this.formatemoji(item.icon, item.name)} ${item.name}`,
          [
            item.group,
            item.nodes?.[0]?.root?.spiritTree?.spirit?.name,
            item.nodes?.[0]?.root?.spiritTree?.eventInstanceSpirit?.eventInstance?.name,
            item.season?.shortName,
          ]
            .filter(Boolean)
            .join(" \u2022 "),
        ),
      ],
    });
  }
  itemDisplay(item: IItem) {
    return [
      section(
        this.backbtn(this.createCustomId({ tab: DisplayTabs.Items, item: "", filter: "", ...this.state.back })),
        `# ${this.formatemoji(item.icon, item.name)} ${item.name}${item.level ? ` (Lvl ${item.level})` : ""}`,
        [`Type: ${item.type}`, item.subtype ? `Subtype: ${item.subtype}` : null, item.group ? `Group: ${item.group}` : null]
          .filter(Boolean)
          .join(" \u2022 "),
        [
          item.group === "Ultimate" ? "- This is a season's ultimate item and may not return in the future." : "",
          item.group === "Limited" ? "- This is a limited item and may not return in the future." : "",
          item.group === "SeasonPass" ? "- This item was offered with season pass." : "",
        ]
          .filter(Boolean)
          .join("\n"),
      ),
      row(
        this.viewbtn(this.createCustomId({}), { label: "Find Source" }),
        this.viewbtn(this.createCustomId({}), { label: "Favorite" }),
      ),
      separator(true, 1),
      item.dye
        ? row(
            this.viewbtn(this.createCustomId({ filter: "preview" }), {
              label: "Preview",
              style: (this.state.filter ?? "preview") === "preview" ? 2 : 3,
              disabled: (this.state.filter ?? "preview") === "preview",
            }),
            this.viewbtn(this.createCustomId({ filter: "dye" }), {
              label: "Dye Preview",
              style: this.state.filter === "dye" ? 2 : 3,
              disabled: this.state.filter === "dye",
            }),
          )
        : null,
      item.previewUrl && (this.state.filter ?? "preview") === "preview"
        ? mediaGallery(mediaGalleryItem(this.planner.resolveUrls(item.previewUrl), { description: item.name }))
        : null,
      this.state.filter === "dye"
        ? mediaGallery(
            [item.dye?.previewUrl, item.dye?.infoUrl]
              .filter(Boolean)
              .map((url) => mediaGalleryItem(this.planner.resolveUrls(url!), { description: item.name })),
          )
        : null,
    ]
      .flat()
      .filter(Boolean) as APIComponentInContainer[];
  }
}
