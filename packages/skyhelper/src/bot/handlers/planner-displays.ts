import Utils from "@/utils/classes/Utils";
import { CustomId, store } from "@/utils/customId-store";
import { SkyPlannerData } from "@skyhelperbot/constants";
import { container, mediaGallery, mediaGalleryItem, row, section, separator, textDisplay } from "@skyhelperbot/utils";
import { ComponentType, MessageFlags, type APIComponentInContainer } from "discord-api-types/v10";
import type { NavigationState } from "./planner.js";

/**
 * Creates a row of category buttons for navigation
 */
export function createCategoryRow(activeCategory: string, user?: string, backOption?: { page?: number }) {
  // Define categories
  const TOP_LEVEL_CATEGORIES = ["home", "realms", "areas", "spirits", "season", "events", "items", "search"];

  // Define buttons per row (for responsive UI)
  const BUTTONS_PER_ROW = 5;

  // Create a button for each category
  const categoryButtons = TOP_LEVEL_CATEGORIES.map((category) => ({
    type: ComponentType.Button as const,
    label: backOption && category === activeCategory ? "Back" : category.charAt(0).toUpperCase() + category.slice(1),
    custom_id: store
      .serialize(CustomId.PlannerTopLevelNav, {
        tab: Utils.encodeCustomId({ id: "42", tab: category, item: null, page: backOption?.page ?? null }),
        user,
      })
      .toString(),
    style: category === activeCategory ? (backOption ? 4 : 3) : 2,
    disabled: category === activeCategory && !backOption,
  }));

  // Split buttons into rows
  const rows = [];
  for (let i = 0; i < categoryButtons.length; i += BUTTONS_PER_ROW) {
    rows.push(row(categoryButtons.slice(i, i + BUTTONS_PER_ROW)));
  }

  return rows;
}

/**
 * Helper function to create pagination controls
 */
export function createPaginationRow(currentPage: number, totalPages: number, tab: string, user?: string, item?: string | null) {
  console.log(currentPage, totalPages, tab, user, item);
  return row(
    {
      type: ComponentType.Button,
      label: "« First",
      custom_id: store
        .serialize(CustomId.PlannerTopLevelNav, {
          tab: Utils.encodeCustomId({ id: "12", tab, item: item ?? "", page: 1 }),
          user,
        })
        .toString(),
      style: 2,
      disabled: currentPage === 1,
    },
    {
      type: ComponentType.Button,
      label: "‹ Previous",
      custom_id: store
        .serialize(CustomId.PlannerTopLevelNav, {
          tab: Utils.encodeCustomId({ id: "12w1", tab, item: item ?? "", page: Math.max(1, currentPage - 1) }),
          user,
        })
        .toString(),
      style: 2,
      disabled: currentPage === 1,
    },
    {
      type: ComponentType.Button,
      label: `Page ${currentPage}/${totalPages}`,
      custom_id: "dummy_pagination_info",
      style: 2,
      disabled: true,
    },
    {
      type: ComponentType.Button,
      label: "Next ›",
      custom_id: store
        .serialize(CustomId.PlannerTopLevelNav, {
          tab: Utils.encodeCustomId({ id: "213", tab, item: item ?? "", page: Math.min(totalPages, currentPage + 1) }),
          user,
        })
        .toString(),
      style: 2,
      disabled: currentPage === totalPages,
    },
    {
      type: ComponentType.Button,
      label: "Last »",
      custom_id: store
        .serialize(CustomId.PlannerTopLevelNav, {
          tab: Utils.encodeCustomId({ id: "3049", tab, item: item ?? "", page: totalPages }),
          user,
        })
        .toString(),
      style: 2,
      disabled: currentPage === totalPages,
    },
  );
}

/**
 * Format a date for display in Discord
 */
export function formatDateTimestamp(date: any, style?: string) {
  return `<t:${Math.floor(SkyPlannerData.resolveToLuxon(date).toMillis() / 1000)}${style ? `:${style}` : ""}>`;
}

/**
 * Display for a list of realms
 */
export function getRealmsListDisplay(user?: string, data?: any, page: number = 1) {
  const pageSize = 4;
  const realms: SkyPlannerData.IRealm[] = data.realms;
  const totalPages = Math.ceil(realms.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, realms.length);
  const displayedRealms = realms.slice(startIndex, endIndex);

  const components = [
    container(
      createCategoryRow("realms", user),
      separator(),
      textDisplay(`# Realms`),
      ...displayedRealms.map((realm) =>
        section(
          {
            type: ComponentType.Button,
            label: "View Realm",
            custom_id: store
              .serialize(CustomId.PlannerTopLevelNav, {
                tab: Utils.encodeCustomId({ id: "k", tab: "realms", item: realm.guid, page }),
                user: user ?? null,
              })
              .toString(),
            style: 1,
          },
          `**${realm.name}**`,
          `${realm.areas?.length || 0} Areas • ${SkyPlannerData.getSpiritsInRealm(realm.guid, data).length} Spirits • ${SkyPlannerData.getWingedLightsInRealm(realm.guid, data).length} Winged Light`,
        ),
      ),
      separator(),
      createPaginationRow(page, totalPages, "realms", user),
    ),
  ];

  return {
    components,
    flags: MessageFlags.IsComponentsV2,
  };
}

/**
 * Display for a specific realm
 */
export function getRealmDisplay(realmId: string, user?: string, data?: any, page?: number) {
  const realm = SkyPlannerData.getRealmById(realmId, data);
  if (!realm) {
    return {
      components: [
        container(
          row({
            type: ComponentType.Button,
            label: "Back to Realms",
            custom_id: store
              .serialize(CustomId.PlannerTopLevelNav, {
                tab: Utils.encodeCustomId({ id: "35", tab: "realms", item: null, page: 1 }),
                user,
              })
              .toString(),
            style: 2,
          }),
        ),
      ],
      flags: MessageFlags.IsComponentsV2,
    };
  }

  const spirits = SkyPlannerData.getSpiritsInRealm(realmId, data);
  const wingedLights = SkyPlannerData.getWingedLightsInRealm(realmId, data);

  const components = [
    container(
      createCategoryRow("realms", user, { page }),
      separator(),
      textDisplay(`# ${realm.name}`),
      ...(realm.imageUrl ? [mediaGallery(mediaGalleryItem(realm.imageUrl))] : []),
      textDisplay(`## Areas (${realm.areas?.length || 0})`),
      ...(realm.areas?.slice(0, 2).map((area) =>
        section(
          {
            type: ComponentType.Button,
            label: "View Area",
            custom_id: store
              .serialize(CustomId.PlannerTopLevelNav, {
                tab: Utils.encodeCustomId({ id: "8", tab: "areas", item: area.guid, page: null }),
                user,
              })
              .toString(),
            style: 1,
          },
          `**${area.name}**`,
          `${area.spirits?.length || 0} Spirits • ${area.wingedLights?.length || 0} Winged Light`,
        ),
      ) || []),
      ...(realm.areas?.length! > 2
        ? [
            section(
              {
                type: ComponentType.Button,
                label: "View All Areas",
                custom_id: store
                  .serialize(CustomId.PlannerTopLevelNav, {
                    tab: Utils.encodeCustomId({ id: "7", tab: "areas", item: "filter_realm_" + realmId, page: null }),
                    user,
                  })
                  .toString(),
                style: 2,
              },
              `View all ${realm.areas?.length} areas...`,
            ),
          ]
        : []),
      separator(),
      textDisplay(`## Spirits (${spirits.length})`),
      ...(spirits.slice(0, 2).map((spirit) =>
        section(
          {
            type: ComponentType.Button,
            label: "View Spirit",
            custom_id: store
              .serialize(CustomId.PlannerTopLevelNav, {
                tab: Utils.encodeCustomId({ id: "6", tab: "spirits", item: spirit.guid, page: null }),
                user,
              })
              .toString(),
            style: 1,
          },
          `**${spirit.name || "Unknown Spirit"}**`,
          `${spirit.season?.name || "Base Game"}`,
        ),
      ) || []),
      ...(spirits.length > 2
        ? [
            section(
              {
                type: ComponentType.Button,
                label: "View All Spirits",
                custom_id: store
                  .serialize(CustomId.PlannerTopLevelNav, {
                    tab: Utils.encodeCustomId({ id: "5", tab: "spirits", item: "filter_realm_" + realmId, page: null }),
                    user,
                  })
                  .toString(),
                style: 2,
              },
              `View all ${spirits.length} spirits...`,
            ),
          ]
        : []),
      separator(),
      textDisplay(`## Winged Light (${wingedLights.length})`),
      ...(wingedLights.length > 0
        ? [
            section(
              {
                type: ComponentType.Button,
                label: "View Winged Light Map",
                custom_id: store
                  .serialize(CustomId.PlannerTopLevelNav, {
                    tab: Utils.encodeCustomId({ id: "4", tab: "wingedLigh", item: "filter_realm_" + realmId, page: null }),
                    user,
                  })
                  .toString(),
                style: 1,
              },
              `View all ${wingedLights.length} winged light locations...`,
            ),
          ]
        : []),
    ),
  ];

  return {
    components,
    flags: MessageFlags.IsComponentsV2,
  };
}

/**
 * Generic "Coming Soon" display for features not yet implemented
 */
export function getComingSoonDisplay(feature: string, user?: string) {
  return {
    components: [
      container(
        textDisplay(`${feature} - Coming Soon!`),
        row({
          type: ComponentType.Button,
          label: "Back to Home",
          custom_id: store
            .serialize(CustomId.PlannerTopLevelNav, {
              tab: Utils.encodeCustomId({ id: "1", tab: "home", item: null, page: null }),
              user,
            })
            .toString(),
          style: 2,
        }),
      ),
    ],
    flags: MessageFlags.IsComponentsV2,
  };
}

// Placeholder functions for other displays
interface IPaginatedProps<T> {
  title: string;
  items: T[];
  user?: string;
  tab: string;
  page?: number;
  itemLabelFn: (i: T) => string;
  itemDescFn: (i: T) => string;
  itemGuidFn: (i: T) => string;
  maxComponents?: number;
}
// Helper for paginated list display
function displayPaginatedList<T>({
  title,
  items,
  user,
  tab,
  page = 1,
  itemLabelFn,
  itemDescFn,
  itemGuidFn,
  maxComponents = 40,
}: IPaginatedProps<T>) {
  const pageSize = 5; // 2 components per item, reserve for nav/buttons
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, items.length);
  const displayedItems: T[] = items.slice(startIndex, endIndex);
  let components: APIComponentInContainer[] = [
    ...createCategoryRow(tab, user),
    separator(),
    textDisplay(`# ${title} (${items.length})`),
    separator(),
  ];
  for (const [i, item] of displayedItems.entries()) {
    if (components.length + 2 > maxComponents) break;
    components.push(
      section(
        {
          type: ComponentType.Button,
          label: "View",
          custom_id: store
            .serialize(CustomId.PlannerTopLevelNav, {
              tab: Utils.encodeCustomId({ id: i, tab: tab as any, item: itemGuidFn(item) }),
              user,
            })
            .toString(),
          style: 1,
        },
        `**${itemLabelFn(item)}**`,
        itemDescFn(item),
      ),
    );
  }
  components.push(separator());
  components.push(createPaginationRow(page, totalPages, tab, user));

  return {
    components,
    flags: MessageFlags.IsComponentsV2,
  };
}

export function getAreasListDisplay(user?: string, data?: any, page: number = 1) {
  return displayPaginatedList({
    title: "Areas",
    items: data.areas as SkyPlannerData.IArea[],
    user,
    tab: "areas",
    page,
    itemLabelFn: (a) => a.name,
    itemDescFn: (a) =>
      `${a.realm?.name || "Unknown Realm"} • ${a.spirits?.length || 0} Spirits • ${a.wingedLights?.length || 0} Winged Light`,
    itemGuidFn: (a) => a.guid,
  });
}

export function getAreaDisplay(areaId: string, user?: string, data?: SkyPlannerData.TransformedData) {
  const area = data?.areas.find((a) => a.guid === areaId);
  if (!area) return getComingSoonDisplay("Area Details", user);
  let components = [
    ...createCategoryRow("areas", user),
    separator(),
    textDisplay(`# ${area.name}`),
    ...(area.imageUrl ? [mediaGallery(mediaGalleryItem(area.imageUrl))] : []),
    separator(),
    textDisplay(
      `Realm: ${area.realm?.name || "Unknown"}\nSpirits: ${area.spirits?.length || 0}\nWinged Light: ${area.wingedLights?.length || 0}`,
    ),
    separator(),
    row(
      {
        type: ComponentType.Button,
        label: "Back to Areas",
        custom_id: store.serialize(CustomId.PlannerTopLevelNav, { tab: "areas", user }).toString(),
        style: 2,
      },
      {
        type: ComponentType.Button,
        label: "Home",
        custom_id: store.serialize(CustomId.PlannerTopLevelNav, { tab: "home", user }).toString(),
        style: 2,
      },
    ),
  ];
  return { flags: MessageFlags.IsComponentsV2, components };
}

export function getSpiritsListDisplay(user?: string, data?: SkyPlannerData.TransformedData, page: number = 1) {
  return displayPaginatedList({
    title: "Spirits",
    items: data?.spirits ?? [],
    user,
    tab: "spirits",
    page,
    itemLabelFn: (s) => s.name || "Unknown Spirit",
    itemDescFn: (s) => `${s.season?.name || "Base Game"} • ${s.type || ""}`,
    itemGuidFn: (s) => s.guid,
  });
}

export function getSpiritDisplay(spiritId: string, user?: string, data?: SkyPlannerData.TransformedData) {
  const spirit = data?.spirits.find((s) => s.guid === spiritId);
  if (!spirit) return getComingSoonDisplay("Spirit Details", user);
  let components = [
    ...createCategoryRow("spirits", user),
    separator(),
    textDisplay(`# ${spirit.name || "Unknown Spirit"}`),
    ...(spirit.imageUrl ? [mediaGallery(mediaGalleryItem(spirit.imageUrl))] : []),
    separator(),
    textDisplay(`Season: ${spirit.season?.name || "Base Game"}\nType: ${spirit.type || ""}`),
    separator(),
    row(
      {
        type: ComponentType.Button,
        label: "Back to Spirits",
        custom_id: store.serialize(CustomId.PlannerTopLevelNav, { tab: "spirits", user }).toString(),
        style: 2,
      },
      {
        type: ComponentType.Button,
        label: "Home",
        custom_id: store.serialize(CustomId.PlannerTopLevelNav, { tab: "home", user }).toString(),
        style: 2,
      },
    ),
  ];
  return { flags: MessageFlags.IsComponentsV2, components };
}

export function getSeasonsListDisplay(user?: string, data?: SkyPlannerData.TransformedData, page: number = 1) {
  return displayPaginatedList({
    title: "Seasons",
    items: data?.seasons ?? [],
    user,
    tab: "season",
    page,
    itemLabelFn: (s) => s.name,
    itemDescFn: (s) => `Start: ${formatDateTimestamp(s.date)} • End: ${formatDateTimestamp(s.endDate)}`,
    itemGuidFn: (s) => s.guid,
  });
}

export function getSeasonDisplay(seasonId: string, user?: string, data?: SkyPlannerData.TransformedData) {
  const season = data?.seasons.find((s) => s.guid === seasonId);
  if (!season) return getComingSoonDisplay("Season Details", user);
  let components = [
    ...createCategoryRow("season", user),
    separator(),
    textDisplay(`# ${season.name}`),
    ...(season.imageUrl ? [mediaGallery(mediaGalleryItem(season.imageUrl))] : []),
    separator(),
    textDisplay(`Start: ${formatDateTimestamp(season.date)}\nEnd: ${formatDateTimestamp(season.endDate)}`),
    separator(),
    row(
      {
        type: ComponentType.Button,
        label: "Back to Seasons",
        custom_id: store.serialize(CustomId.PlannerTopLevelNav, { tab: "season", user }).toString(),
        style: 2,
      },
      {
        type: ComponentType.Button,
        label: "Home",
        custom_id: store.serialize(CustomId.PlannerTopLevelNav, { tab: "home", user }).toString(),
        style: 2,
      },
    ),
  ];
  return { flags: MessageFlags.IsComponentsV2, components };
}

export function getEventsListDisplay(user?: string, data?: SkyPlannerData.TransformedData, page: number = 1) {
  return displayPaginatedList({
    title: "Events",
    items: data?.events ?? [],
    user,
    tab: "events",
    page,
    itemLabelFn: (e) => e.name,
    itemDescFn: (e) => `Instances: ${e.instances?.length || 0}`,
    itemGuidFn: (e) => e.guid,
  });
}

export function getEventDisplay(eventId: string, user?: string, data?: SkyPlannerData.TransformedData) {
  const event = data?.events.find((e) => e.guid === eventId);
  if (!event) return getComingSoonDisplay("Event Details", user);
  let components = [
    ...createCategoryRow("events", user),
    separator(),
    textDisplay(`# ${event.name}`),
    ...(event.imageUrl ? [mediaGallery(mediaGalleryItem(event.imageUrl))] : []),
    separator(),
    textDisplay(`Instances: ${event.instances?.length || 0}`),
    separator(),
    row(
      {
        type: ComponentType.Button,
        label: "Back to Events",
        custom_id: store.serialize(CustomId.PlannerTopLevelNav, { tab: "events", user }).toString(),
        style: 2,
      },
      {
        type: ComponentType.Button,
        label: "Home",
        custom_id: store.serialize(CustomId.PlannerTopLevelNav, { tab: "home", user }).toString(),
        style: 2,
      },
    ),
  ];
  return { flags: MessageFlags.IsComponentsV2, components };
}

export function getItemsListDisplay(user?: string, data?: SkyPlannerData.TransformedData, page: number = 1) {
  return displayPaginatedList({
    title: "Items",
    items: data?.items ?? [],
    user,
    tab: "items",
    page,
    itemLabelFn: (i) => i.name,
    itemDescFn: (i) => `${i.type || ""}`,
    itemGuidFn: (i) => i.guid,
  });
}

export function getItemDisplay(itemId: string, user?: string, data?: SkyPlannerData.TransformedData) {
  const item = data?.items.find((i) => i.guid === itemId);
  if (!item) return getComingSoonDisplay("Item Details", user);
  let components = [
    ...createCategoryRow("items", user),
    separator(),
    textDisplay(`# ${item.name}`),
    ...(item.previewUrl ? [mediaGallery(mediaGalleryItem(item.previewUrl))] : []),
    separator(),
    textDisplay(`Type: ${item.type || ""}`),
    separator(),
    row(
      {
        type: ComponentType.Button,
        label: "Back to Items",
        custom_id: store.serialize(CustomId.PlannerTopLevelNav, { tab: "items", user }).toString(),
        style: 2,
      },
      {
        type: ComponentType.Button,
        label: "Home",
        custom_id: store.serialize(CustomId.PlannerTopLevelNav, { tab: "home", user }).toString(),
        style: 2,
      },
    ),
  ];
  return { flags: MessageFlags.IsComponentsV2, components };
}

export function getSearchDisplay(query?: string | null, user?: string, data?: any) {
  // Simple search by name
  if (!query) return getComingSoonDisplay("Search", user);
  const results = SkyPlannerData.searchEntitiesByName(query, data);
  return displayPaginatedList({
    title: `Search Results for "${query}"`,
    items: results,
    user,
    tab: "search",
    page: 1,
    itemLabelFn: (r) => `${r.type}: ${r.name}`,
    itemDescFn: (r) => `GUID: ${r.guid}`,
    itemGuidFn: (r) => r.guid,
  });
}

export function getFavoritesDisplay(user?: string, data?: any) {
  // Placeholder: implement user favorites
  return getComingSoonDisplay("Favorites", user);
}

export function getSettingsDisplay(user?: string) {
  // Placeholder: implement settings
  return getComingSoonDisplay("Settings", user);
}
