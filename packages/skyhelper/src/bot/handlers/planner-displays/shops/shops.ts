import { button, container, row, section, separator, textDisplay } from "@skyhelperbot/utils";
import { BasePlannerHandler } from "../base.js";
import { emojis, type SkyPlannerData } from "@skyhelperbot/constants";
import type { IIAP, IItemListNode } from "@skyhelperbot/constants/skygame-planner";

// Remember to not use `d` for shop routes, it is  used to reroute to permanent shops
export class ShopsDisplay extends BasePlannerHandler {
  listItems: SkyPlannerData.IItemListNode[] = [];
  iaps: SkyPlannerData.IIAP[] = [];
  shops: SkyPlannerData.IShop[] = [];
  override handle() {
    if (!this.state.it) throw new Error("No shop specified");
    const shopIds = this.state.it.split(",");
    this.shops = this.data.shops.filter((s) => shopIds.includes(s.guid));
    for (const shop of this.shops) {
      if (shop.itemList) this.listItems.push(...shop.itemList.items);
      if (shop.iaps) this.iaps.push(...shop.iaps);
    }
    if (this.listItems.length && this.iaps.length) this.state.f ??= "store";
    const shop = this.shops[0]!; // only used for names and location
    return { components: [container(this.shopdisplay(shop))] };
  }

  shopdisplay(shop: SkyPlannerData.IShop) {
    return [
      section(
        this.homebtn(),
        `# ${this.getshopname(shop)}`,
        `${this.formatemoji(emojis.location, "Location")} ${this.getshoplocation(shop)}`,
      ),
      separator(),
      ...(this.state.f ? [this.getfilterrow()] : []),
      textDisplay(
        this.state.f === "store" ? "Store Items" + ` (${this.listItems.length})` : "In-App Purchases" + ` (${this.iaps.length})`,
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
        custom_id: this.createCustomId({ f: "store" }),
        label: "Store",
        style: this.state.f === "store" ? 3 : 2,
        disabled: this.state.f === "store",
      }),
      button({
        custom_id: this.createCustomId({ f: "iap" }),
        label: "IAP",
        style: this.state.f === "iap" ? 3 : 2,
        disabled: this.state.f === "iap",
      }),
      this.backbtn(this.createCustomId({ it: "", ...this.state.b, b: null }), {
        disabled: !this.state.b,
      }),
    );
  }

  getItemsListDisplay() {
    return this.displayPaginatedList({
      items: (this.state.f === "store" ? this.listItems.map((i) => ({ ...i, type: "list" })) : this.iaps) as Array<
        (IItemListNode & { type: string }) | IIAP
      >,
      itemCallback: (as) => [
        ...("type" in as
          ? [
              section(
                // TODO: handle acquiring the item
                this.viewbtn(this.createCustomId({ d: "sldjfh" }), { label: "Acquire" }),
                `${this.formatemoji(as.item.emoji, as.item.name)} ${as.item.name}`,
                this.planner.formatCosts(as),
              ),
              separator(false),
            ].flat()
          : [
              textDisplay(
                as.name ?? "In-App Purchase",
                `$ ${as.price ?? "N/A"} | ${as.returning ? "Returning" : "New"} IAP`,
                [as.items?.map((i) => `${this.formatemoji(i.emoji, i.name)} ${i.name}`), this.planner.formatCosts(as)]
                  .flat()
                  .filter(Boolean)
                  .join(" \u2022 "),
              ),

              /** TODO:  handle buying/recieving the item */
              row(
                button({ custom_id: this.createCustomId({ it: as.guid, d: "Buy" }), label: "Bought", style: 3 }),
                button({ custom_id: this.createCustomId({ it: as.guid, d: "Receive" }), label: "Received", style: 2 }),
              ),
            ]),
      ],
    });
  }
}
