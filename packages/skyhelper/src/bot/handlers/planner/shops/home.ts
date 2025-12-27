import { BasePlannerHandler } from "../base.js";
import { button, container, section, separator, textDisplay } from "@skyhelperbot/utils";
import { getIGCnIApDisplay } from "./shared.js";
import type { IIAP, IItemList, IShop } from "skygame-data";
import { permanentShopConfigs } from "./config.js";

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
    const storeconfigs = permanentShopConfigs(this);
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
