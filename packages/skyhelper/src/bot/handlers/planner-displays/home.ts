import { BasePlannerHandler } from "./base.js";
import { SeasonsDisplay } from "./seasons.js";
import { button, container, section, separator, textDisplay, thumbnail } from "@skyhelperbot/utils";
import { ComponentType, MessageFlags, type APIComponentInContainer } from "discord-api-types/v10";
import { DateTime } from "luxon";
import {
  formatCurrencies,
  getSpiritEmoji,
  type IEvent,
  type IEventInstance,
  type IItemListNode,
  type IReturningSpirits,
  type ITravelingSpirit,
  type IItem,
  allTreeItems,
  type ISeason,
  type IShop,
} from "@skyhelperbot/constants/skygame-planner";
import type { ResponseData } from "@/utils/classes/InteractionUtil";
import { DisplayTabs } from "@/types/planner";
import { CustomId, store } from "@/utils/customId-store";

export class HomeDisplay extends BasePlannerHandler {
  override handle(): ResponseData {
    const activeSeason = this.planner.getCurrentSeason(this.data);
    const activeEvents = this.planner.getEvents(this.data);
    const returningSpirits = this.planner.getCurrentReturningSpirits(this.data);
    const travelingSpirit = this.planner.getCurrentTravelingSpirit(this.data);

    const s_display = new SeasonsDisplay(
      this.data,
      this.planner,
      { t: DisplayTabs.Seasons, user: this.state.user },
      this.settings,
      this.client,
    );

    const availableFavorites = this.getAvailableFavoritedItems(
      activeSeason,
      activeEvents.current.map((e) => e.instance),
      returningSpirits,
      travelingSpirit,
    );

    const components = [
      container(
        this.createTopCategoryRow(DisplayTabs.Home, this.state.user),
        separator(),
        textDisplay("-# This is a new feature! Any bug reports and feedback are appreciated!"),
        section(
          button({
            label: "Update",
            custom_id: store.serialize(CustomId.Default, { data: "currency_modify", user: this.state.user }),
          }),
          `# Currencies:`,
          formatCurrencies(this.data, this.settings.plannerData ?? this.planner.PlannerDataHelper.createEmpty()),
        ),
        ...(availableFavorites.length > 0 ? this.createFavoritesReminder(availableFavorites) : []),
        ...(activeSeason ? s_display.getSeasonInListDisplay(activeSeason) : []),
        ...(travelingSpirit ? this.createTravelingSpiritSection(travelingSpirit) : []),
        ...(returningSpirits.length > 0 ? this.createReturningSpiritsSections(returningSpirits) : []),
        ...(activeEvents.current.length || activeEvents.upcoming.length ? this.createEventsSection(activeEvents) : []),
      ),
    ];

    return {
      components,
      flags: MessageFlags.IsComponentsV2,
    };
  }

  private createTravelingSpiritSection(t: ITravelingSpirit) {
    return [
      section(
        {
          type: ComponentType.Button,
          label: "View Spirit",
          custom_id: this.createCustomId({
            t: DisplayTabs.Spirits,

            it: t.spirit.guid,
            // passing this in `i` because all the properties are used for one thing or another
            // passing other tree so that index is correctly calculated based on how it is handled in spirits display
            // TODO: eventually think of a better way to do this, maybe when the spirit tree selection is refactored
            i: `tree${[t.tree, ...(t.spirit.treeRevisions ?? []), ...(t.spirit.returns ?? []), ...(t.spirit.ts ?? [])].findIndex((x) => x.guid === t.guid).toString()}`,
          }),
          style: 1,
        },
        `### Traveling Spirit`,
        `**${t.spirit.emoji ? `<:_:${t.spirit.emoji}> ` : ""}${t.spirit.name}**`,
        `Available until ${this.formatDateTimestamp(t.endDate ?? this.planner.resolveToLuxon(t.date).plus({ days: 3 }))} (${this.formatDateTimestamp(t.endDate ?? this.planner.resolveToLuxon(t.date).plus({ days: 3 }), "R")})`,
      ),
      separator(),
    ];
  }

  private createReturningSpiritsSections(returningSpirits: IReturningSpirits[]) {
    const sections: APIComponentInContainer[] = [
      textDisplay(`### Returning Spirits - Special Visits (${returningSpirits.length})`),
      ...returningSpirits.slice(0, 3).flatMap((visit) => [
        section(
          {
            type: ComponentType.Button,
            label: "View Details",
            custom_id: this.createCustomId({ t: DisplayTabs.Spirits, it: visit.guid, d: "rs" }),
            style: 1,
          },
          `**${visit.name ?? "Returning Spirits"}**`,
          `${visit.spirits.length} spirits • Until ${this.formatDateTimestamp(visit.endDate)} (${this.formatDateTimestamp(visit.endDate, "R")})`,
        ),
      ]),
    ];

    if (returningSpirits.length > 3) {
      sections.push(
        section(
          {
            type: ComponentType.Button,
            label: "View All",
            custom_id: this.createCustomId({ t: DisplayTabs.Spirits, d: "rs" }),
            style: 2,
          },
          `_View all ${returningSpirits.length} returning spirit events..._`,
        ),
      );
    }

    sections.push(separator());
    return sections;
  }

  private createEventsSection(activeEvents: any) {
    return [
      textDisplay("### Events"),
      ...activeEvents.current.flatMap((event: any) => this.createEventInHome(event)),
      ...activeEvents.upcoming.slice(0, 3).flatMap((event: any) => this.createEventInHome(event)),
      separator(),
    ];
  }

  private createEventInHome(event: { event: IEvent; instance: IEventInstance; startDate?: DateTime }) {
    const subtitles = [
      `From ${this.formatDateTimestamp(event.instance.date)} to ${this.formatDateTimestamp(event.instance.endDate)}`,
      event.instance.spirits.length
        ? [
            ...event.instance.spirits
              .map((s) => {
                const emoji = getSpiritEmoji(s);
                return emoji ? `<:_:${emoji}>` : null;
              })
              .filter(Boolean),
            this.planner.formatGroupedCurrencies(
              [
                event.instance.spirits.map((c) => c.tree),
                event.instance.shops.flatMap((sh) => sh.itemList?.items).filter(Boolean) as IItemListNode[],
              ].flat(),
            ),
          ]
        : null,
    ]
      .flat()
      .filter(Boolean) as [string, ...string[]];

    return [
      section(
        {
          type: ComponentType.Button,
          label: "View Event",
          custom_id: this.createCustomId({ t: DisplayTabs.Events, it: event.event.guid }),
          style: 1,
        },
        `**${event.event.name}** (${event.startDate ? "Starts" : "Ends"} ${this.formatDateTimestamp(event.instance.endDate, "R")})`,
      ),
      event.event.imageUrl ? section(thumbnail(event.event.imageUrl), ...subtitles) : textDisplay(...subtitles),
    ];
  }

  /**
   * Get list of favorited items that are currently available through various sources
   */
  private getAvailableFavoritedItems(
    activeSeason?: ISeason,
    activeEventInstances?: IEventInstance[],
    returningSpirits?: IReturningSpirits[],
    travelingSpirit?: ITravelingSpirit | null,
  ): Array<{ item: IItem; source: string; sourceDetails: string }> {
    const favoritesString = this.settings.plannerData?.favourites ?? "";
    if (!favoritesString) return [];

    const availableItems: Array<{ item: IItem; source: string; sourceDetails: string }> = [];

    // Get all favorited item GUIDs
    const favoritedGuids = favoritesString.split(",").filter(Boolean);
    const getShopItem = (shop: IShop, guid: string, source: string) => {
      const spItem = shop.itemList?.items.find((item) => item.item.guid === guid)?.item;
      if (spItem) availableItems.push({ item: spItem, source, sourceDetails: shop.name ?? shop.spirit?.name ?? "Shop" });

      const iap = shop.iaps?.find((ip) => ip.items?.some((item) => item.guid === guid));
      if (iap) {
        const item = iap.items!.find((it) => it.guid === guid)!;
        availableItems.push({
          item,
          source,
          sourceDetails: `${iap.name ?? "IAP"} (${iap.returning ? `Returning IAP` : "New IAP"})`,
        });
      }
      if (shop.spirit?.tree) {
        const items = allTreeItems(shop.spirit.tree);
        const item = items.find((it) => it.guid === guid);
        if (item) {
          availableItems.push({ item, source, sourceDetails: `From: ${shop.spirit.name}` });
        }
      }
    };
    // Check each favorited item
    for (const guid of favoritedGuids) {
      const item = this.data.guidMap.get(guid) as IItem | undefined;
      if (!item || item.unlocked) continue; // Skip if not found or already unlocked

      // Check if available via Traveling Spirit
      if (travelingSpirit) {
        const hasItem = allTreeItems(travelingSpirit.tree).some((i) => i.guid === guid);
        if (hasItem) {
          availableItems.push({
            item,
            source: "Traveling Spirit",
            sourceDetails: travelingSpirit.spirit.name,
          });
          continue;
        }
      }

      // Check if available via Returning Spirits
      for (const rs of returningSpirits ?? []) {
        const rsItems = rs.spirits.flatMap((s) => allTreeItems(s.tree));
        if (rsItems.some((i) => i.guid === guid)) {
          availableItems.push({
            item,
            source: "Returning Spirits",
            sourceDetails: rs.name ?? "Special Visit",
          });
          break;
        }
      }

      // Check if available via current Season
      if (activeSeason) {
        const seasonItems = activeSeason.spirits.flatMap((sp) => (sp.tree ? allTreeItems(sp.tree) : []));
        if (seasonItems.some((i: any) => i.guid === guid)) {
          availableItems.push({
            item,
            source: "Current Season",
            sourceDetails: activeSeason.name,
          });
          continue;
        }
        if (activeSeason.shops) {
          // eslint-disable-next-line
          activeSeason.shops.forEach((sh) => getShopItem(sh, guid, `${activeSeason.name} Shop`));
        }
      }

      // Check if available via Events
      for (const instance of activeEventInstances ?? []) {
        const eventItems = instance.spirits.flatMap((s) => allTreeItems(s.tree));
        if (eventItems.some((i) => i.guid === guid)) {
          availableItems.push({
            item,
            source: "Event",
            sourceDetails: instance.event.name,
          });
          break;
        }
        // eslint-disable-next-line
        instance.shops.forEach((sh) => getShopItem(sh, guid, `${instance.name ?? instance.event.name} Shop`));
      }
    }

    return availableItems;
  }

  /**
   * Create a reminder section showing favorited items that are currently available
   */
  private createFavoritesReminder(
    availableItems: Array<{ item: IItem; source: string; sourceDetails: string }>,
  ): APIComponentInContainer[] {
    const itemsToShow = availableItems.slice(0, 5); // Show max 5 items to avoid clutter

    return [
      textDisplay(`### ⭐ Favorited Items Available Now! (${availableItems.length})`),
      ...itemsToShow.map((entry) =>
        section(
          button({
            label: "View Item",
            custom_id: this.createCustomId({ t: DisplayTabs.Items, it: entry.item.guid }),
            style: 1,
          }),
          `**${this.formatemoji(entry.item.emoji, entry.item.name)} ${entry.item.name}**`,
          `Available via ${entry.source}: ${entry.sourceDetails}`,
        ),
      ),
      ...(availableItems.length > 5
        ? [
            textDisplay(
              `-# +${availableItems.length - 5} more favorited item${availableItems.length - 5 > 1 ? "s" : ""} available`,
            ),
          ]
        : []),
      separator(),
    ];
  }
}
