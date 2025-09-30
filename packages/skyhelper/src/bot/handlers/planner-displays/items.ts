import { ItemType, type IItem } from "@skyhelperbot/constants/skygame-planner";
import { BasePlannerHandler, DisplayTabs } from "./base.js";
import { FilterType } from "./filter.manager.js";
import { button, container, mediaGallery, mediaGalleryItem, row, section, separator, textDisplay } from "@skyhelperbot/utils";

import type { APIComponentInContainer } from "discord-api-types/v10";

export class ItemsDisplay extends BasePlannerHandler {
  constructor(data: any, planner: any, state: any) {
    super(data, planner, state);
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
  itemslist(items: IItem[]) {
    return this.displayPaginatedList({
      items,
      page: this.state.p ?? 1,
      perpage: 7,
      user: this.state.user,
      itemCallback: (item) => [
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
        this.backbtn(this.createCustomId({ t: DisplayTabs.Items, it: "", f: "", ...this.state.b })),
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
        ? mediaGallery(mediaGalleryItem(this.planner.resolveUrls(item.previewUrl), { description: item.name }))
        : null,
      this.state.f === "dye"
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
