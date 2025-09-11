import Utils from "@/utils/classes/Utils";
import { CustomId, store } from "@/utils/customId-store";
import { SkyPlannerData, zone } from "@skyhelperbot/constants";
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

const TOP_LEVEL_CATEGORIES = ["home", "realms", "areas", "spirits", "season", "events", "items", "search"] as const;
type TopLevelCategory = (typeof TOP_LEVEL_CATEGORIES)[number];

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

const createCategoryRow = (selected: TopLevelCategory = "home", user?: string) => {
  // Split into two rows if needed due to Discord's 5-button limit
  const firstRow = TOP_LEVEL_CATEGORIES.slice(0, 5);
  const secondRow = TOP_LEVEL_CATEGORIES.slice(5);

  const rows = [
    row(
      firstRow.map((cat) => ({
        type: ComponentType.Button,
        style: cat === selected ? 3 : 2,
        label: cat[0].toUpperCase() + cat.slice(1),
        disabled: cat === selected && firstRow.includes(cat),
        custom_id: store
          .serialize(CustomId.PlannerTopLevelNav, {
            tab: Utils.encodeCustomId({ id: "k", tab: cat, item: null, page: null }),
            user,
          })
          .toString(),
      })),
    ),
  ];

  // Add second row if needed
  if (secondRow.length > 0) {
    rows.push(
      row(
        secondRow.map((cat) => ({
          type: ComponentType.Button,
          style: cat === selected ? 3 : 2,
          label: cat[0].toUpperCase() + cat.slice(1),
          disabled: cat === selected && secondRow.includes(cat),
          custom_id: store
            .serialize(CustomId.PlannerTopLevelNav, {
              tab: Utils.encodeCustomId({ id: "k", tab: cat, item: null, page: null }),
              user,
            })
            .toString(),
        })),
      ),
    );
  }

  return rows;
};

/**
 * Main handler for planner navigation
 */
export async function handlePlannerNavigation(state: NavigationState) {
  const { tab, user, item, page = 1 } = state;

  // Make sure we have the latest data
  const data = await SkyPlannerData.getSkyGamePlannerData();

  // Import the display functions only when needed
  const displays = await import("./planner-displays.js");

  // Handle navigation based on the current tab
  switch (tab) {
    case "home":
      return getHomeDisplay(user);

    case "realms":
      return item ? displays.getRealmDisplay(item, user, data) : displays.getRealmsListDisplay(user, data, page);

    case "areas":
      return item ? displays.getAreaDisplay(item, user, data) : displays.getAreasListDisplay(user, data, page);

    case "spirits":
      return item ? displays.getSpiritDisplay(item, user, data) : displays.getSpiritsListDisplay(user, data, page);

    case "season":
      return item ? displays.getSeasonDisplay(item, user, data) : displays.getSeasonsListDisplay(user, data, page);

    case "events":
      return item ? displays.getEventDisplay(item, user, data) : displays.getEventsListDisplay(user, data, page);

    case "items":
      return item ? displays.getItemDisplay(item, user, data) : displays.getItemsListDisplay(user, data, page);

    case "search":
      return displays.getSearchDisplay(item, user, data);

    // @ts-expect-error to be implemente
    case "favorites":
      return displays.getFavoritesDisplay(user, data);

    // @ts-expect-error to be implemented
    case "settings":
      return displays.getSettingsDisplay(user);

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
  const stats = SkyPlannerData.getDataStats(data);

  const components = [
    container(
      createCategoryRow("home", user),
      separator(),
      textDisplay(
        `# Sky Planner\n_Data from SkyGame Planner by Silverfeelin_`,
        `**Stats:** ${stats.realms} Realms • ${stats.areas} Areas • ${stats.spirits} Spirits • ${stats.items} Items • ${stats.wingedLights} Winged Light`,
      ),
      separator(),
      ...(activeSeasons
        ? [
            section(
              {
                type: ComponentType.Button,
                label: "View Season",
                custom_id: store
                  .serialize(CustomId.PlannerTopLevelNav, {
                    tab: Utils.encodeCustomId({ id: "12", tab: "season", item: activeSeasons.guid }),
                    user,
                  })
                  .toString(),
                style: 1,
              },
              `### Current Season`,
              `${activeSeasons.icon ? `<:_:${activeSeasons.icon}>` : ""} **${activeSeasons.name}**`,
              `${formatDateTimestamp(activeSeasons.date)} - End: ${formatDateTimestamp(activeSeasons.endDate)} (${formatDateTimestamp(activeSeasons.endDate, "R")})`,
            ),
            separator(),
          ]
        : []),
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
              `### Current Traveling Spirit`,
              `**${travelingSpirit.spirit.name}**`,
              `Available until ${formatDateTimestamp(travelingSpirit.endDate)} (${formatDateTimestamp(travelingSpirit.endDate, "R")})`,
            ),
            separator(),
          ]
        : []),
      ...(returningSpirits.length > 0
        ? [
            textDisplay(`### Active Returning Spirits (${returningSpirits.length})`),
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
