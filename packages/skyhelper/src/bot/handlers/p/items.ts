import { ItemType, type IItem } from "node_modules/@skyhelperbot/constants/dist/skygame-planner/interfaces.js";
import { BasePlannerHandler, DisplayTabs } from "./base.js";
import { button, container, row, section, separator } from "@skyhelperbot/utils";
import { emojis } from "@skyhelperbot/constants";
const ItemCategory = {
  [ItemType.Outfit]: [ItemType.Outfit, ItemType.Shoes],
  [ItemType.Mask]: [ItemType.Mask, ItemType.Necklace, ItemType.FaceAccessory],
  [ItemType.Hair]: [ItemType.Hair, ItemType.HeadAccessory, ItemType.HairAccessory],
  [ItemType.Cape]: [],
  [ItemType.Prop]: [ItemType.Prop, ItemType.Held, ItemType.Furniture, ItemType.Music],
};
export class ItemsDisplay extends BasePlannerHandler {
  override handle() {
    this.state.filter ??= "Outfit-Outfit"; // default to outfit
    const [mainCategory, subCategory] = this.state.filter.split("-");
    const items = this.data.items.filter((i) => i.type === (subCategory || mainCategory));
    return {
      components: [container(this.createItemsNav(mainCategory, subCategory), ...this.itemslist(items))],
    };
  }
  createItemsNav(main: string, sub: string) {
    const mainnav = Object.keys(ItemCategory).map((cat, i) =>
      button({
        label: main === cat ? "Home" : cat + "s",
        custom_id: this.createCustomId({
          tab: main === cat ? DisplayTabs.Home : this.state.tab,
          filter: `${cat}-${ItemCategory[cat as keyof typeof ItemCategory][0] ?? ""}`,
        }),
        style: main === cat ? 4 : 2,
        emoji: main === cat ? { id: emojis.leftarrow } : undefined,
      }),
    );
    const subnav = ItemCategory[main as keyof typeof ItemCategory].map((cat, i) =>
      button({
        label: cat,
        custom_id: this.createCustomId({ filter: `${main}-${cat}` }),
        style: sub === cat ? 3 : 2,
        disabled: sub === cat,
      }),
    );
    return [
      row(mainnav),
      separator(true, 1),
      row(subnav, button({ label: "Filter (TBD)", style: 1, custom_id: "sdw", disabled: true })),
    ];
  }
  itemslist(items: IItem[]) {
    return this.displayPaginatedList({
      items,
      page: this.state.page ?? 1,
      perpage: this.state.filter!.split("-")[0] === "Prop" ? 6 : 7,
      tab: this.state.tab,
      user: this.state.user,
      filter: this.state.filter,
      itemCallback: (item) => [
        section(
          button({
            label: "View",
            custom_id: this.createCustomId({ item: item.guid }),
            style: 1,
          }),
          `## ${this.formatemoji(item.icon, item.name)} ${item.name}`,
          [
            item.group,
            item.nodes?.[0]?.root?.spiritTree?.spirit?.name,
            item.nodes?.[0].root?.spiritTree?.eventInstanceSpirit?.eventInstance?.name,
            item.season?.shortName,
          ]
            .filter(Boolean)
            .join(" \u2022 "),
        ),
      ],
    });
  }
}
