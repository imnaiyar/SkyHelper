import Utils from "@/utils/classes/Utils";
import { CustomId, store } from "@/utils/customId-store";
import { APPLICATION_EMOJIS, emojis, realms_emojis, SkyPlannerData, zone } from "@skyhelperbot/constants";
import {
  button,
  container,
  mediaGallery,
  mediaGalleryItem,
  row,
  section,
  separator,
  textDisplay,
  thumbnail,
} from "@skyhelperbot/utils";
import { ComponentType, MessageFlags } from "discord-api-types/v10";
import { DateTime } from "luxon";
import type { TransformedData } from "node_modules/@skyhelperbot/constants/dist/skygame-planner/transformer.js";
import { getSeasonInListDisplay } from "./planner-displays.js";
import { SpiritsDisplay } from "./p/spirits.js";
import { BasePlannerHandler, DisplayTabs } from "./p/base.js";

const TOP_LEVEL_CATEGORIES = ["home", "realms", "spirits", "season", "events", "items", "wingedLights", "shops"] as const;
export type TopLevelCategory = (typeof TOP_LEVEL_CATEGORIES)[number];

const formatDateTimestamp = (date: any, style?: string) =>
  `<t:${Math.floor(SkyPlannerData.resolveToLuxon(date).toMillis() / 1000)}${style ? `:${style}` : ""}>`;

// Navigation state interface to track user's position
export interface NavigationState {
  tab: TopLevelCategory;
  item: string | null; // GUID of the item or category identifier
  parent?: string | null; // Previous navigation state for back button
  page?: number; // For paginated lists
  filter?: string; // For filtered views
  user?: string;
}

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
      custom_id: store
        .serialize(CustomId.PlannerTopLevelNav, {
          tab: Utils.encodeCustomId({ id: "42", tab: category, item: null, page: backOption?.page ?? null }),
          user,
        })
        .toString(),
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

/**
 * Main handler for planner navigation
 */
export async function handlePlannerNavigation(state: NavigationState) {
  const { tab, user, item, page = 1, filter } = state;

  const data = await SkyPlannerData.getSkyGamePlannerData();

  const displays = await import("./planner-displays.js");

  switch (tab) {
    case "home":
      return getHomeDisplay(user);

    case "realms":
      return item ? displays.getRealmDisplay(item, data, user) : displays.getRealmsListDisplay(data, user, page);

    case "spirits":
      return new SpiritsDisplay(data, SkyPlannerData).spiritlist({
        filter: filter ?? SkyPlannerData.SpiritType.Regular,
        page,
        user,
        spirit: item ?? undefined,
      });
    case "season":
      return item ? displays.getSeasonDisplay(item, data, user) : displays.getSeasonsListDisplay(data, user, page);

    case "events":
      return item ? displays.getEventDisplay(item, data, user) : displays.getEventsListDisplay(data, user, page);

    case "items":
      return item ? displays.getItemDisplay(item, data, user) : displays.getItemsListDisplay(data, user, page);

    default:
      return getHomeDisplay(user);
  }
}

export async function getHomeDisplay(user?: string) {
  // make sure data is refreshed
  const data = await SkyPlannerData.getSkyGamePlannerData();
  const activeSeasons = SkyPlannerData.getCurrentSeason(data);
  const activeEvents = SkyPlannerData.getEvents(data);
  const returningSpirits = SkyPlannerData.getCurrentReturningSpirits(data);
  const travelingSpirit = SkyPlannerData.getCurrentTravelingSpirit(data);
  const handler = new BasePlannerHandler(data, SkyPlannerData);

  const components = [
    container(
      handler.createTopCategoryRow(DisplayTabs.Home, user),
      separator(),
      ...(activeSeasons ? getSeasonInListDisplay(activeSeasons, user) : []),
      ...(travelingSpirit
        ? [
            section(
              {
                type: ComponentType.Button,
                label: "View Spirit",
                custom_id: store
                  .serialize(CustomId.PlannerTopLevelNav, {
                    tab: Utils.encodeCustomId({ id: "12", tab: "spirits", item: travelingSpirit.guid }),
                    user,
                  })
                  .toString(),
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
                  custom_id: store
                    .serialize(CustomId.PlannerTopLevelNav, {
                      tab: Utils.encodeCustomId({ id: "12", tab: "events", item: visit.guid }),
                      user,
                    })
                    .toString(),
                  style: 1,
                },
                `**${visit.return.name || "Returning Spirits"}**`,
                `${visit.return.spirits.length || 0} spirits • Until ${formatDateTimestamp(visit.return.endDate)} (${formatDateTimestamp(visit.return.endDate, "R")})`,
              ),
            ]),
            ...(returningSpirits.length > 3
              ? [
                  section(
                    {
                      type: ComponentType.Button,
                      label: "View All",
                      custom_id: store
                        .serialize(CustomId.PlannerTopLevelNav, {
                          tab: "returning",
                          user,
                        })
                        .toString(),
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
            ...activeEvents.current.flatMap((event) => [
              ...(event.event.imageUrl ? [mediaGallery(mediaGalleryItem(event.event.imageUrl))] : []),
              section(
                {
                  type: ComponentType.Button,
                  label: "View Event",
                  custom_id: store
                    .serialize(CustomId.PlannerTopLevelNav, {
                      tab: Utils.encodeCustomId({ id: "12", tab: "events", item: event.event.guid }),
                      user,
                    })
                    .toString(),
                  style: 1,
                },
                `**${event.event.name}** (Ends ${formatDateTimestamp(event.instance.endDate, "R")})`,
                `From ${formatDateTimestamp(event.instance.date)} to ${formatDateTimestamp(event.instance.endDate)}`,
              ),
            ]),
            ...activeEvents.upcoming.slice(0, 3).flatMap((event) => [
              section(
                {
                  type: ComponentType.Button,
                  label: "View Event",
                  custom_id: store
                    .serialize(CustomId.PlannerTopLevelNav, {
                      tab: Utils.encodeCustomId({ id: "23", tab: "events", item: event.event.guid }),
                      user,
                    })
                    .toString(),
                  style: 2,
                },
                `**${event.event.name}** (Starts ${formatDateTimestamp(event.instance.date, "R")})`,
                `From ${formatDateTimestamp(event.instance.date)} to ${formatDateTimestamp(event.instance.endDate)}`,
              ),
            ]),
            ...(activeEvents.upcoming.length > 3
              ? [
                  section(
                    {
                      type: ComponentType.Button,
                      label: "View All",
                      custom_id: store
                        .serialize(CustomId.PlannerTopLevelNav, {
                          tab: "events", // TODO: make it more specific, pointing to the upcoming event
                          user,
                        })
                        .toString(),
                      style: 2,
                    },
                    `_View all ${activeEvents.upcoming.length} upcoming events..._`,
                  ),
                ]
              : []),
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
