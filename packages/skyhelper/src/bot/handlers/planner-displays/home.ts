import { BasePlannerHandler } from "./base.js";
import { SeasonsDisplay } from "./seasons.js";
import { container, section, separator, textDisplay, thumbnail } from "@skyhelperbot/utils";
import { ComponentType, MessageFlags, type APIComponentInContainer } from "discord-api-types/v10";
import { DateTime } from "luxon";
import {
  calculateUserProgress,
  getSpiritEmoji,
  type IEvent,
  type IEventInstance,
  type IItemListNode,
  type IReturningSpirits,
  type ITravelingSpirit,
} from "@skyhelperbot/constants/skygame-planner";
import type { ResponseData } from "@/utils/classes/InteractionUtil";
import { DisplayTabs } from "@/types/planner";
import Utils from "@/utils/classes/Utils";

export class HomeDisplay extends BasePlannerHandler {
  override handle(): ResponseData {
    const activeSeasons = this.planner.getCurrentSeason(this.data);
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
    const progress = calculateUserProgress(this.data);
    const components = [
      container(
        this.createTopCategoryRow(DisplayTabs.Home, this.state.user),
        separator(),
        textDisplay(
          "-# This feature is in active development. Some things are not implemented yet, few things may even break. Feedback and bug reports are appreciated.",
          `### Progress`,
          ...Object.entries(progress).map(
            ([type, p]) => `${Utils.capitalize(type)}: ${"unlocked" in p ? p.unlocked : p.bought}/${p.total} (${p.percentage}%)`,
          ),
        ),
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
            ...event.instance.spirits.map((s) => getSpiritEmoji(s) && `<:_:${getSpiritEmoji(s)}>`).filter(Boolean),
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
}
