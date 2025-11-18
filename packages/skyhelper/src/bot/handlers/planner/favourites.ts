import type { ResponseData } from "@/utils/classes/InteractionUtil";
import { BasePlannerHandler } from "./base.js";
import type { UserSchema } from "@/types/schemas";
import { button, container, section, separator, textDisplay } from "@skyhelperbot/utils";
import { DisplayTabs } from "@/types/planner";
import { ItemsDisplay } from "./items.js";
import { CostUtils } from "./helpers/cost.utils.js";
import { SpiritTreeHelper, type ICost, type IItem, type IShop, type ISkyData } from "skygame-data";
import { PlannerService } from "./helpers/planner.service.js";

export class FavouriteDisplay extends BasePlannerHandler {
  public override handle(): ResponseData {
    const available = FavouriteDisplay.getAvailableFavoritedItems(this.data, this.settings);
    const igcCosts = CostUtils.groupedToCostEmoji(available.filter((i) => i.cost).map((c) => c.cost!));
    const iapCost = available.reduce((acc, item) => {
      if (item.price) acc += item.price;
      return acc;
    }, 0);
    return {
      components: [
        container(
          textDisplay(
            `# ⭐ Favorited Items Available Now! (${available.length})`,
            `**Total:** ${igcCosts ?? ""}${iapCost ? ` $${iapCost}` : ""}`,
          ),
          separator(),
          ...this.displayPaginatedList({
            perpage: 6,
            items: available,
            itemCallback: (entry) => {
              const source = ItemsDisplay.getItemSourceNavigation(entry.item, this.createCustomId.bind(this), {
                t: DisplayTabs.Favourite,
              });
              const texts = [
                `**${this.formatemoji(entry.item.emoji, entry.item.name)} ${entry.item.name}**`,
                `Available via ${entry.source}: ${entry.sourceDetails}`,
                entry.cost ? (CostUtils.groupedToCostEmoji([entry.cost]) ?? "No Cost") : "",
                entry.price ? `$${entry.price}` : "",
              ]
                .filter(Boolean)
                .join("\n");
              return [
                source
                  ? section(
                      button({
                        label: "Go To!",
                        custom_id: source,
                        style: 1,
                      }),
                      texts,
                    )
                  : textDisplay(texts),
              ];
            },
          }),
        ),
      ],
    };
  }

  /**
   * Get list of favorited items that are currently available through various sources
   */
  static getAvailableFavoritedItems(
    data: ISkyData,
    settings: UserSchema,
  ): Array<{ item: IItem; source: string; cost?: ICost; price?: number; sourceDetails: string }> {
    const activeSeason = PlannerService.getCurrentSeason(data);
    const activeEventInstances = PlannerService.getEvents(data).current.map((e) => e.instance);
    const returningSpirits = PlannerService.getCurrentSpecialVisits(data);
    const travelingSpirit = PlannerService.getCurrentTravelingSpirit(data);
    const favoritesString = settings.plannerData?.favourites ?? "";
    if (!favoritesString) return [];

    const availableItems: Array<{ item: IItem; source: string; cost?: ICost; price?: number; sourceDetails: string }> = [];

    // Get all favorited item GUIDs
    const favoritedGuids = favoritesString.split(",").filter(Boolean);
    const getShopItem = (shop: IShop, guid: string, source: string) => {
      const spItem = shop.itemList?.items.find((item) => item.item.guid === guid);
      if (spItem) {
        availableItems.push({ item: spItem.item, cost: spItem, source, sourceDetails: shop.name ?? shop.spirit?.name ?? "Shop" });
      }

      const iap = shop.iaps?.find((ip) => ip.items?.some((item) => item.guid === guid));
      if (iap) {
        const item = iap.items!.find((it) => it.guid === guid)!;
        availableItems.push({
          item,
          source,
          price: iap.price,
          sourceDetails: `${iap.name ?? "IAP"} (${iap.returning ? `Returning IAP` : "New IAP"})`,
        });
      }
      if (shop.spirit?.tree) {
        const items = SpiritTreeHelper.getItems(shop.spirit.tree, true);
        const item = items.find((it) => it.guid === guid);
        const node = SpiritTreeHelper.getNodes(shop.spirit.tree).find(
          (n) => n.item?.guid === item?.guid || n.hiddenItems?.some((it) => it.guid === item?.guid),
        );
        if (item) {
          availableItems.push({ item, source, cost: node, sourceDetails: `From: ${shop.spirit.name}` });
        }
      }
    };
    // Check each favorited item
    for (const guid of favoritedGuids) {
      const item = data.guids.get(guid) as IItem | undefined;
      if (!item || item.unlocked) continue; // Skip if not found or already unlocked

      // Check if available via Traveling Spirit
      if (travelingSpirit) {
        const node = SpiritTreeHelper.getNodes(travelingSpirit.tree).find((n) => n.item?.guid === item.guid);
        if (node) {
          availableItems.push({
            item,
            source: "Traveling Spirit",
            cost: node,
            sourceDetails: travelingSpirit.spirit.name,
          });
          continue;
        }
      }

      // Check if available via Returning Spirits
      for (const rs of returningSpirits) {
        const node = rs.spirits.flatMap((s) => SpiritTreeHelper.getNodes(s.tree)).find((n) => n.item?.guid === item.guid);
        const spirit = node ? node.root?.spiritTree?.spirit : undefined;
        if (node) {
          availableItems.push({
            item,
            cost: node,
            source: "Returning Spirits",
            sourceDetails: `${rs.name ?? "Special Visit"}${spirit ? ` (Offered by ${spirit.name})` : ""}`,
          });
          break;
        }
      }

      // Check if available via current Season
      if (activeSeason) {
        const node = activeSeason.spirits
          .flatMap((sp) => (sp.tree ? SpiritTreeHelper.getNodes(sp.tree) : []))
          .find((n) => n.item?.guid === item.guid);
        const spirit = node ? node.root?.spiritTree?.spirit : undefined;
        if (node) {
          availableItems.push({
            item,
            cost: node,
            source: "Current Season",
            sourceDetails: activeSeason.name + (spirit ? ` (${spirit.name})` : ""),
          });
          continue;
        }
        if (activeSeason.shops) {
          // eslint-disable-next-line
          activeSeason.shops.forEach((sh) => getShopItem(sh, guid, `${activeSeason.name} Shop`));
        }
      }

      // Check if available via Events
      for (const instance of activeEventInstances) {
        const node = instance.spirits.flatMap((s) => SpiritTreeHelper.getNodes(s.tree)).find((n) => n.item?.guid === item.guid);
        const spirit = node ? node.root?.spiritTree?.eventInstanceSpirit : undefined;
        if (node) {
          availableItems.push({
            item,
            source: "Event",
            cost: node,
            sourceDetails: instance.event.name + (spirit ? ` (${spirit.name ?? spirit.spirit.name})` : ""),
          });
          break;
        }
        // eslint-disable-next-line
        instance.shops.forEach((sh) => getShopItem(sh, guid, `${instance.name ?? instance.event.name} Shop`));
      }
    }

    return availableItems;
  }
}
