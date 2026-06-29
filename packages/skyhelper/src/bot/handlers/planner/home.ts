import { BasePlannerHandler } from "./base.js";
import { SeasonsDisplay } from "./seasons.js";
import { button, container, section, separator, textDisplay, thumbnail } from "@skyhelperbot/utils";
import { ComponentType, MessageFlags, type APIComponentInContainer } from "discord-api-types/v10";
import { DateTime } from "luxon";
import type { ResponseData } from "@/utils/classes/InteractionUtil";
import { DisplayTabs } from "@/types/planner";
import { CustomId, store } from "@/utils/customId-store";
import { FavouriteDisplay } from "./favourites.js";
import { PlannerService } from "./helpers/planner.service.js";
import { PlannerDataService } from "./helpers/data.service.js";
import type { ICost, IEvent, IEventInstance, IItem, IItemListNode, ISpecialVisit, ITravelingSpirit } from "skygame-data";
import { CostUtils } from "./helpers/cost.utils.js";

export class HomeDisplay extends BasePlannerHandler {
  override handle(): ResponseData {
    const activeSeason = PlannerService.getCurrentSeason(this.data);
    const activeEvents = PlannerService.getEvents(this.data);
    const returningSpirits = PlannerService.getCurrentSpecialVisits(this.data);
    const travelingSpirit = PlannerService.getCurrentTravelingSpirit(this.data);

    const s_display = new SeasonsDisplay(
      this.data,
      { t: DisplayTabs.Seasons, user: this.state.user },
      this.settings,
      this.client,
    );

    const availableFavorites = FavouriteDisplay.getAvailableFavoritedItems(this.data, this.settings);

    const components = [
      container(
        this.createTopCategoryRow(DisplayTabs.Home, this.state.user),
        separator(),
        section(
          button({
            label: "Update",
            custom_id: store.serialize(CustomId.Default, { data: "currency_modify", user: this.state.user }),
          }),
          `# Currencies:`,
          PlannerDataService.userCurrencyToEmoji(this.data, this.settings.plannerData ?? PlannerDataService.createEmpty()),
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
            i: `tree${t.tree.guid}`,
          }),
          style: 1,
        },
        `### Traveling Spirit`,
        `**${t.spirit.emoji ? `<:_:${t.spirit.emoji}> ` : ""}${t.spirit.name}**`,
        `Available until ${this.formatDateTimestamp(t.endDate ?? t.date.plus({ days: 3 }))} (${this.formatDateTimestamp(t.endDate ?? t.date.plus({ days: 3 }), "R")})`,
        "\u200b",
      ),
    ];
  }

  private createReturningSpiritsSections(returningSpirits: ISpecialVisit[]) {
    const sections: APIComponentInContainer[] = [
      textDisplay(`### Returning Spirits - Special Visits (${returningSpirits.length})`),
      ...returningSpirits.slice(0, 3).flatMap((visit) => [
        section(
          {
            type: ComponentType.Button,
            label: "View Details",
            custom_id: this.createCustomId({ t: DisplayTabs.Spirits, it: visit.guid, d: "sv" }),
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

  private createEventsSection(activeEvents: ReturnType<typeof PlannerService.getEvents>) {
    return [
      ...activeEvents.current.flatMap((event) => this.createEventInHome(event)),
      ...activeEvents.upcoming.slice(0, 3).flatMap((event) => this.createEventInHome(event)),
    ];
  }

  private createEventInHome(event: { event: IEvent; instance: IEventInstance; startDate?: DateTime }) {
    const subtitles = [
      `From ${this.formatDateTimestamp(event.instance.date)} to ${this.formatDateTimestamp(event.instance.endDate)}`,

      event.instance.spirits?.length
        ? [
            ...event.instance.spirits
              .map((s) => {
                return s.spirit.emoji ? `<:_:${s.spirit.emoji}>` : null;
              })
              .filter(Boolean),
            CostUtils.groupedToCostEmoji(
              [
                event.instance.spirits.map((c) => c.tree),

                event.instance.shops?.flatMap((sh) => sh.itemList?.items).filter(Boolean) as IItemListNode[],
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
          custom_id: this.createCustomId({ t: DisplayTabs.Events, it: event.event.guid, d: event.instance.guid }),
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
    const igcCosts = CostUtils.groupedToCostEmoji(itemsToShow.filter((i) => i.cost).map((c) => c.cost!));
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
