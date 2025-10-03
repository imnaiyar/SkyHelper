import { BasePlannerHandler, DisplayTabs } from "./base.js";
import { SeasonsDisplay } from "./seasons.js";
import { CustomId, store } from "@/utils/customId-store";
import { container, section, separator, textDisplay, thumbnail } from "@skyhelperbot/utils";
import { ComponentType, MessageFlags, type APIComponentInContainer } from "discord-api-types/v10";
import { DateTime } from "luxon";
import type { IEvent, IEventInstance, IItemListNode } from "@skyhelperbot/constants/skygame-planner";
import type { ResponseData } from "@/utils/classes/InteractionUtil";

export class HomeDisplay extends BasePlannerHandler {
  override handle(): ResponseData {
    const activeSeasons = this.planner.getCurrentSeason(this.data);
    const activeEvents = this.planner.getEvents(this.data);
    const returningSpirits = this.planner.getCurrentReturningSpirits(this.data);
    const travelingSpirit = this.planner.getCurrentTravelingSpirit(this.data);

    const s_display = new SeasonsDisplay(this.data, this.planner, { t: DisplayTabs.Seasons, user: this.state.user });

    const components = [
      container(
        this.createTopCategoryRow(DisplayTabs.Home, this.state.user),
        separator(),
        ...(activeSeasons ? s_display.getSeasonInListDisplay(activeSeasons) : []),
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

  private createTravelingSpiritSection(travelingSpirit: any) {
    return [
      section(
        {
          type: ComponentType.Button,
          label: "View Spirit",
          custom_id: store.serialize(CustomId.PlannerTopLevelNav, {
            t: "spirits",
            it: travelingSpirit.guid,
            i: "12",
            f: null,
            p: null,
            d: null,
            r: null,
            user: this.state.user,
            back: null,
          }),
          style: 1,
        },
        `### Traveling Spirit`,
        `**${travelingSpirit.spirit.icon ? `<:_:${travelingSpirit.spirit.icon}> ` : ""}${travelingSpirit.spirit.name}**`,
        `Available until ${this.formatDateTimestamp(travelingSpirit.endDate)} (${this.formatDateTimestamp(travelingSpirit.endDate, "R")})`,
      ),
      separator(),
    ];
  }

  private createReturningSpiritsSections(returningSpirits: any[]) {
    const sections: APIComponentInContainer[] = [
      textDisplay(`### Returning Spirits - Special Visits (${returningSpirits.length})`),
      ...returningSpirits.slice(0, 3).flatMap((visit) => [
        section(
          {
            type: ComponentType.Button,
            label: "View Details",
            custom_id: store.serialize(CustomId.PlannerTopLevelNav, {
              t: "events",
              it: visit.guid,
              user: this.state.user,
              i: "12",
              f: null,
              p: null,
              d: null,
              r: null,
              back: null,
            }),
            style: 1,
          },
          `**${visit.return.name ?? "Returning Spirits"}**`,
          `${visit.return.spirits.length} spirits • Until ${this.formatDateTimestamp(visit.return.endDate)} (${this.formatDateTimestamp(visit.return.endDate, "R")})`,
        ),
      ]),
    ];

    if (returningSpirits.length > 3) {
      sections.push(
        section(
          {
            type: ComponentType.Button,
            label: "View All",
            custom_id: store.serialize(CustomId.PlannerTopLevelNav, {
              t: "returning",
              user: this.state.user,
              it: null,
              i: "12",
              f: null,
              p: null,
              d: null,
              r: null,
              back: null,
            }),
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
            ...event.instance.spirits.map((s) => s.tree.node.item?.emoji && `<:_:${s.tree.node.item.emoji}>`).filter(Boolean),
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
          custom_id: store.serialize(CustomId.PlannerTopLevelNav, {
            user: this.state.user,
            t: "events",
            it: event.event.guid,
            i: "123",
            f: null,
            p: null,
            d: null,
            r: null,
            back: null,
          }),
          style: 1,
        },
        `**${event.event.name}** (${event.startDate ? "Starts" : "Ends"} ${this.formatDateTimestamp(event.instance.endDate, "R")})`,
      ),
      event.event.imageUrl ? section(thumbnail(event.event.imageUrl), ...subtitles) : textDisplay(...subtitles),
    ];
  }
}
