import Utils from "@/utils/classes/Utils";
import { CustomId, store } from "@/utils/customId-store";
import { emojis, realms_emojis, SkyPlannerData, zone } from "@skyhelperbot/constants";
import { button, container, row, section, separator, textDisplay, thumbnail } from "@skyhelperbot/utils";
import { ComponentType, MessageFlags } from "discord-api-types/v10";
import { DateTime } from "luxon";
import type { TransformedData } from "@skyhelperbot/constants/skygame-planner";
import { SpiritsDisplay } from "./planner-displays/spirits.js";
import { BasePlannerHandler, DisplayTabs, type NavigationState } from "./planner-displays/base.js";
import { RealmsDisplay } from "./planner-displays/realms.js";
import { ItemsDisplay } from "./planner-displays/items.js";
import { SeasonsDisplay } from "./planner-displays/seasons.js";
import { EventsDisplay } from "./planner-displays/events.js";
import { WingedLightsDisplay } from "./planner-displays/wingedlights.js";
import { ShopsDisplay } from "./planner-displays/shops.js";
import type { IEvent, IEventInstance, IItemListNode } from "@skyhelperbot/constants/skygame-planner";

const TOP_LEVEL_CATEGORIES = ["home", "realms", "spirits", "season", "events", "items", "wingedLights", "shops"] as const;
export type TopLevelCategory = (typeof TOP_LEVEL_CATEGORIES)[number];

const formatDateTimestamp = (date: any, style?: string) =>
  `<t:${Math.floor(SkyPlannerData.resolveToLuxon(date).toMillis() / 1000)}${style ? `:${style}` : ""}>`;

// Navigation state interface to track user's position

const CATEGORY_EMOJI_MAP = {
  home: realms_emojis.Home,
  realms: realms_emojis["Isle of Dawn"],
  events: emojis.eventticket,
  wingedLights: emojis.wingwedge,
};
/**
 * Creates a row of category buttons for navigation
 */
export function createCategoryRow(
  selected: TopLevelCategory,
  data: TransformedData,
  user?: string,
  backOption?: { page?: number },
) {
  const BUTTONS_PER_ROW = 4;
  const seasonIcon = SkyPlannerData.getCurrentSeason(data)?.icon ?? data.seasons[0]?.icon;
  const categoryButtons = TOP_LEVEL_CATEGORIES.map((category) => {
    const icon = category === "season" ? seasonIcon : CATEGORY_EMOJI_MAP[category as keyof typeof CATEGORY_EMOJI_MAP];

    return button({
      label: backOption && category === selected ? "Back" : category.charAt(0).toUpperCase() + category.slice(1),
      custom_id: store.serialize(CustomId.PlannerTopLevelNav, {
        tab: Utils.encodeCustomId({ id: "42", tab: category, item: null, page: backOption?.page ?? null }),
        user,
      }),
      emoji: icon ? { id: icon } : undefined,
      style: category === selected ? (backOption ? 4 : 3) : 2,
      disabled: category === selected && !backOption,
    });
  });

  const rows = [];
  for (let i = 0; i < categoryButtons.length; i += BUTTONS_PER_ROW) {
    rows.push(row(categoryButtons.slice(i, i + BUTTONS_PER_ROW)));
  }

  return rows;
}

const displayClasses = {
  [DisplayTabs.Events]: EventsDisplay,
  [DisplayTabs.Realms]: RealmsDisplay,
  [DisplayTabs.Items]: ItemsDisplay,
  [DisplayTabs.Seasons]: SeasonsDisplay,
  [DisplayTabs.Spirits]: SpiritsDisplay,
  [DisplayTabs.Shops]: ShopsDisplay,
  [DisplayTabs.WingedLights]: WingedLightsDisplay,
};

/**
 * Main handler for planner navigation
 */
export async function handlePlannerNavigation(state: NavigationState) {
  const { tab, user } = state;

  const data = await SkyPlannerData.getSkyGamePlannerData();
  switch (tab) {
    case DisplayTabs.Home:
      return getHomeDisplay(user);
    default: {
      const handler = displayClasses[tab as keyof typeof displayClasses];
      // eslint-disable-next-line
      return handler ? new handler(data, SkyPlannerData, state).handle() : getHomeDisplay(user);
    }
  }
}

export async function getHomeDisplay(user?: string) {
  // make sure data is refreshed
  const data = await SkyPlannerData.getSkyGamePlannerData();
  const activeSeasons = SkyPlannerData.getCurrentSeason(data);
  const activeEvents = SkyPlannerData.getEvents(data);
  const returningSpirits = SkyPlannerData.getCurrentReturningSpirits(data);
  const travelingSpirit = SkyPlannerData.getCurrentTravelingSpirit(data);
  const handler = new BasePlannerHandler(data, SkyPlannerData, { tab: DisplayTabs.Home, user });
  const s_display = new SeasonsDisplay(data, SkyPlannerData, { tab: DisplayTabs.Seasons, user });
  const components = [
    container(
      handler.createTopCategoryRow(DisplayTabs.Home, user),
      separator(),
      ...(activeSeasons ? s_display.getSeasonInListDisplay(activeSeasons) : []),
      ...(travelingSpirit
        ? [
            section(
              {
                type: ComponentType.Button,
                label: "View Spirit",
                custom_id: store.serialize(CustomId.PlannerTopLevelNav, {
                  tab: Utils.encodeCustomId({ id: "12", tab: "spirits", item: travelingSpirit.guid }),
                  user,
                }),
                style: 1,
              },
              `### Traveling Spirit`,
              `**${travelingSpirit.spirit.icon ? `<:_:${travelingSpirit.spirit.icon}> ` : ""}${travelingSpirit.spirit.name}**`,
              `Available until ${formatDateTimestamp(travelingSpirit.endDate)} (${formatDateTimestamp(travelingSpirit.endDate, "R")})`,
            ),
            separator(),
          ]
        : []),
      ...(returningSpirits.length > 0
        ? [
            textDisplay(`### Returning Spirits - Special Visits (${returningSpirits.length})`),
            ...returningSpirits.slice(0, 3).flatMap((visit) => [
              section(
                {
                  type: ComponentType.Button,
                  label: "View Details",
                  custom_id: store.serialize(CustomId.PlannerTopLevelNav, {
                    tab: Utils.encodeCustomId({ id: "12", tab: "events", item: visit.guid }),
                    user,
                  }),
                  style: 1,
                },
                `**${visit.return.name ?? "Returning Spirits"}**`,
                `${visit.return.spirits.length} spirits • Until ${formatDateTimestamp(visit.return.endDate)} (${formatDateTimestamp(visit.return.endDate, "R")})`,
              ),
            ]),
            ...(returningSpirits.length > 3
              ? [
                  section(
                    {
                      type: ComponentType.Button,
                      label: "View All",
                      custom_id: store.serialize(CustomId.PlannerTopLevelNav, {
                        tab: "returning",
                        user,
                      }),
                      style: 2,
                    },
                    `_View all ${returningSpirits.length} returning spirit events..._`,
                  ),
                ]
              : []),
            separator(),
          ]
        : []),
      ...(activeEvents.current.length || activeEvents.upcoming.length
        ? [
            textDisplay("### Events"),
            ...activeEvents.current.flatMap((event) => eventInHome(event, user)),
            ...activeEvents.upcoming.slice(0, 3).flatMap((event) => eventInHome(event, user)),
            separator(),
          ]
        : []),
    ),
  ];
  return {
    components,
    flags: MessageFlags.IsComponentsV2,
  };
}

function eventInHome(event: { event: IEvent; instance: IEventInstance; startDate?: DateTime }, user?: string) {
  const subtitles = [
    `From ${formatDateTimestamp(event.instance.date)} to ${formatDateTimestamp(event.instance.endDate)}`,
    event.instance.spirits.length
      ? [
          ...event.instance.spirits.map((s) => s.tree.node.item?.icon && `<:_:${s.tree.node.item.icon}>`).filter(Boolean),
          SkyPlannerData.formatGroupedCurrencies(
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
          tab: Utils.encodeCustomId({ id: "12", tab: "events", item: event.event.guid }),
          user,
        }),
        style: 1,
      },
      `**${event.event.name}** (${event.startDate ? "Starts" : "Ends"} ${formatDateTimestamp(event.instance.endDate, "R")})`,
    ),
    event.event.imageUrl ? section(thumbnail(event.event.imageUrl), ...subtitles) : textDisplay(...subtitles),
  ];
}
