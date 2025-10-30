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
  type ICost,
  formatGroupedCurrencies,
} from "@skyhelperbot/constants/skygame-planner";
import type { ResponseData } from "@/utils/classes/InteractionUtil";
import { DisplayTabs } from "@/types/planner";
import { CustomId, store } from "@/utils/customId-store";
import { FavouriteDisplay } from "./favourites.js";

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

    const availableFavorites = FavouriteDisplay.getAvailableFavoritedItems(this.data, this.settings);

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
        separator(),
        ...this.displayPaginatedList({
          items: [
            availableFavorites.length > 0 ? this.createFavoritesReminder(availableFavorites) : [],
            activeSeason ? s_display.getSeasonInListDisplay(activeSeason) : [],
            travelingSpirit ? this.createTravelingSpiritSection(travelingSpirit) : [],
            returningSpirits.length > 0 ? this.createReturningSpiritsSections(returningSpirits) : [],
            activeEvents.current.length || activeEvents.upcoming.length ? this.createEventsSection(activeEvents) : [],
          ].filter((s) => s.length > 0),
          itemCallback: (i) => i,
          perpage: 3,
        }),
        separator(),
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
        "\u200b",
      ),
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
          "\u200b",
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
    return sections;
  }

  private createEventsSection(activeEvents: ReturnType<typeof import("@skyhelperbot/constants").SkyPlannerData.getEvents>) {
    return [
      ...activeEvents.current.flatMap((event) => this.createEventInHome(event)),
      ...activeEvents.upcoming.slice(0, 3).flatMap((event) => this.createEventInHome(event)),
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
      "\u200b",
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
   * Create a reminder section showing favorited items that are currently available
   */
  private createFavoritesReminder(
    availableItems: Array<{ item: IItem; source: string; cost?: ICost; price?: number; sourceDetails: string }>,
  ): APIComponentInContainer[] {
    const itemsToShow = availableItems;
    const igcCosts = formatGroupedCurrencies(itemsToShow.filter((i) => i.cost).map((c) => c.cost!));
    const iapCost = itemsToShow.reduce((acc, item) => {
      if (item.price) acc += item.price;
      return acc;
    }, 0);
    return [
      section(
        this.viewbtn(this.createCustomId({ t: DisplayTabs.Favourite })),
        `### ⭐ Favorited Items Available Now! (${availableItems.length})`,
        "# " + itemsToShow.map((entry) => this.formatemoji(entry.item.emoji, entry.item.name)).join(" "),
        `**Total:** ${igcCosts ?? ""}${iapCost ? ` $${iapCost}` : ""}\n\u200b`,
      ),
    ];
  }
}
