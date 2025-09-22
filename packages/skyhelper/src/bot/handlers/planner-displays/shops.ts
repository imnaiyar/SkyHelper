import { button, container, row, section, separator, textDisplay } from "@skyhelperbot/utils";
import { BasePlannerHandler } from "./base.js";
import { emojis, type SkyPlannerData } from "@skyhelperbot/constants";
import type { IIAP, IItemListNode } from "@skyhelperbot/constants/skygame-planner";

export class ShopsDisplay extends BasePlannerHandler {
  listItems: SkyPlannerData.IItemListNode[] = [];
  iaps: SkyPlannerData.IIAP[] = [];
  shops: SkyPlannerData.IShop[] = [];
  override handle() {
    if (!this.state.item) throw new Error("No shop specified");
    const shopIds = this.state.item.split(",");
    this.shops = this.data.shops.filter((s) => shopIds.includes(s.guid));
    for (const shop of this.shops) {
      if (shop.itemList) this.listItems.push(...shop.itemList.items);
      if (shop.iaps) this.iaps.push(...shop.iaps);
    }
    if (this.listItems.length && this.iaps.length) this.state.filter ??= "store";
    const shop = this.shops[0]!; // only used for names and location
    return { components: [container(this.shopdisplay(shop))] };
  }

  shopdisplay(shop: SkyPlannerData.IShop) {
    return [
      section(
        this.viewbtn(this.createCustomId({ ...this.state.back }), {
          label: "Back",
          emoji: { id: emojis.leftarrow },
          style: 4,
          disabled: !this.state.back,
        }),
        `# ${this.getshopname(shop)}`,
        `${this.formatemoji(emojis.location, "Location")} ${this.getshoplocation(shop)}`,
      ),
      separator(),
      ...(this.state.filter ? [this.getfilterrow()] : []),
      textDisplay(
        this.state.filter === "store"
          ? "Store Items" + ` (${this.listItems.length})`
          : "In-App Purchases" + ` (${this.iaps.length})`,
      ),
      ...this.getItemsListDisplay(),
    ];
  }
  private getshopname(shop: SkyPlannerData.IShop) {
    if (shop.name) return shop.name;
    if (shop.event) return `${shop.event.event.name} Shop`;
    if (shop.season) return `${shop.season.name} Shop`;
    return "Shop";
  }
  private getshoplocation(shop: SkyPlannerData.IShop) {
    return shop.name ?? (shop.type === "Store" ? "Premium Candle Store" : (shop.spirit?.name ?? "Unknown"));
  }
  private getfilterrow() {
    return row(
      button({
        custom_id: this.createCustomId({ filter: "store" }),
        label: "Store",
        style: this.state.filter === "store" ? 3 : 2,
        disabled: this.state.filter === "store",
      }),
      button({
        custom_id: this.createCustomId({ filter: "iap" }),
        label: "IAP",
        style: this.state.filter === "iap" ? 3 : 2,
        disabled: this.state.filter === "iap",
      }),
    );
  }

  getItemsListDisplay() {
    return this.displayPaginatedList({
      /** Only asserting so I get correct type in `itemCallback` bcz aparrentl filter(Boolean) doesnt cut it */
      items: (this.state.filter === "store" ? this.listItems.map((i) => ({ ...i, type: "list" })) : this.iaps) as Array<
        (IItemListNode & { type: string }) | IIAP
      >,
      itemCallback: (as) => [
        ...("type" in as
          ? [
              section(
                this.viewbtn(this.createCustomId({ data: "sldjfh" })),
                `${this.formatemoji(as.item.icon, as.item.name)} ${as.item.name}`,
                this.planner.formatCosts(as),
              ),
              separator(false),
            ].flat()
          : [
              textDisplay(
                as.name ?? "In-App Purchase",
                `$ ${as.price ?? "N/A"} | ${as.returning ? "Returning" : "New"} IAP`,
                [as.items?.map((i) => `${this.formatemoji(i.icon, i.name)} ${i.name}`), this.planner.formatCosts(as)]
                  .flat()
                  .filter(Boolean)
                  .join(" \u2022 "),
              ),
              row(
                button({ custom_id: this.createCustomId({ item: as.guid, data: "Buy" }), label: "Bought", style: 3 }),
                button({ custom_id: this.createCustomId({ item: as.guid, data: "Receive" }), label: "Received", style: 2 }),
              ),
            ]),
      ],
    });
  }
}
