import Utils from "@/utils/classes/Utils";
import { CustomId, store } from "@/utils/customId-store";
import { SkyPlannerData } from "@skyhelperbot/constants";
import { container, mediaGallery, mediaGalleryItem, row, section, separator, textDisplay, thumbnail } from "@skyhelperbot/utils";
import { ComponentType, MessageFlags, type APIComponentInContainer } from "discord-api-types/v10";
import { createCategoryRow, type NavigationState, type TopLevelCategory } from "./planner.js";
import type { TransformedData } from "node_modules/@skyhelperbot/constants/dist/skygame-planner/transformer.js";

/**
 * Helper function to create pagination controls
 */
export function createPaginationRow(currentPage: number, totalPages: number, tab: string, user?: string, item?: string | null) {
  console.log(currentPage, totalPages, Math.min(totalPages, currentPage + 1));

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
export function getRealmsListDisplay(data: TransformedData, user?: string, page: number = 1) {
  const pageSize = 4;
  const realms: SkyPlannerData.IRealm[] = data.realms;
  const totalPages = Math.ceil(realms.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, realms.length);
  const displayedRealms = realms.slice(startIndex, endIndex);

  const components = [
    container(
      createCategoryRow("realms", data, user),
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
export function getRealmDisplay(realmId: string, data: TransformedData, user?: string, page?: number) {
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
      createCategoryRow("realms", data, user, { page }),
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
  data: TransformedData;
  user?: string;
  tab: TopLevelCategory;
  page?: number;
  filter?: string;
  itemLabelFn?: (i: T) => string;
  itemDescFn?: (i: T) => string;
  itemGuidFn?: (i: T) => string;
  itemCallback?: (i: T) => APIComponentInContainer[];
  maxComponents?: number;
}
// Helper for paginated list display
function displayPaginatedList<T>({
  title,
  items,
  user,
  data,
  tab,
  page = 1,
  itemLabelFn,
  itemDescFn,
  itemGuidFn,
  itemCallback,
}: IPaginatedProps<T>) {
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, items.length);
  const displayedItems: T[] = items.slice(startIndex, endIndex);

  const components: APIComponentInContainer[] = [...createCategoryRow(tab, data, user), separator()];
  for (const [i, item] of displayedItems.entries()) {
    if (itemCallback) components.push(...itemCallback(item));
    if (!itemLabelFn || !itemDescFn || !itemGuidFn) continue;
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
  components.push(createPaginationRow(page, totalPages, tab, user));

  return {
    components,
    flags: MessageFlags.IsComponentsV2,
  };
}

// TODO: possibly reuse it when implementing areas
/* export function getAreasListDisplay(data: TransformedData, user?: string, page: number = 1) {
  return displayPaginatedList({
    title: "Areas",
    data,
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

export function getAreaDisplay(areaId: string, data: TransformedData, user?: string) {
  const area = data?.areas.find((a) => a.guid === areaId);
  if (!area) return getComingSoonDisplay("Area Details", user);
  let components = [
    ...createCategoryRow("areas", data, user, {}),
    separator(),
    textDisplay(`# ${area.name}`),
    ...(area.imageUrl ? [mediaGallery(mediaGalleryItem(area.imageUrl))] : []),
    separator(),
    textDisplay(
      `Realm: ${area.realm?.name || "Unknown"}\nSpirits: ${area.spirits?.length || 0}\nWinged Light: ${area.wingedLights?.length || 0}`,
    ),
  ];
  return { flags: MessageFlags.IsComponentsV2, components };
} */
const spirit_cat = ["Regular", "Season", "Elder", "Guide", "Special Spirits"];
export function getSpiritsListDisplay(data: TransformedData, user?: string, page: number = 1) {
  return displayPaginatedList({
    title: "Spirits",
    data,
    items: data.spirits ?? [],
    user,
    tab: "spirits",
    page,
    itemLabelFn: (s) => s.name || "Unknown Spirit",
    itemDescFn: (s) => `${s.season?.name || "Base Game"} • ${s.type || ""}`,
    itemGuidFn: (s) => s.guid,
  });
}

export function getSpiritDisplay(spiritId: string, data: TransformedData, user?: string) {
  const spirit = data?.spirits.find((s) => s.guid === spiritId);
  if (!spirit) return getComingSoonDisplay("Spirit Details", user);
  let components = [
    ...createCategoryRow("spirits", data, user, {}),
    separator(),
    textDisplay(`# ${spirit.name || "Unknown Spirit"}`),
    ...(spirit.imageUrl ? [mediaGallery(mediaGalleryItem(spirit.imageUrl))] : []),
    separator(),
    textDisplay(`Season: ${spirit.season?.name || "Base Game"}\nType: ${spirit.type || ""}`),
  ];
  return { flags: MessageFlags.IsComponentsV2, components };
}

export function getSeasonsListDisplay(data: SkyPlannerData.TransformedData, user?: string, page: number = 1) {
  return displayPaginatedList({
    title: "Seasons",
    items: data?.seasons ?? [],
    data,
    user,
    tab: "season",
    page,
    itemCallback: (s) => getSeasonInListDisplay(s, user),
  });
}

export function getSeasonDisplay(seasonId: string, data: SkyPlannerData.TransformedData, user?: string) {
  const season = data?.seasons.find((s) => s.guid === seasonId);
  if (!season) return getComingSoonDisplay("Season Details", user);
  let components = [
    ...createCategoryRow("season", data, user, {}),
    separator(),
    textDisplay(`# ${season.name}`),
    ...(season.imageUrl ? [mediaGallery(mediaGalleryItem(season.imageUrl))] : []),
    separator(),
    textDisplay(`Start: ${formatDateTimestamp(season.date)}\nEnd: ${formatDateTimestamp(season.endDate)}`),
  ];
  return { flags: MessageFlags.IsComponentsV2, components };
}

export function getEventsListDisplay(data: SkyPlannerData.TransformedData, user?: string, page: number = 1) {
  return displayPaginatedList({
    title: "Events",
    items: data?.events ?? [],
    data,
    user,
    tab: "events",
    page,
    itemLabelFn: (e) => e.name,
    itemDescFn: (e) => `Instances: ${e.instances?.length || 0}`,
    itemGuidFn: (e) => e.guid,
  });
}

export function getEventDisplay(eventId: string, data: SkyPlannerData.TransformedData, user?: string) {
  const event = data?.events.find((e) => e.guid === eventId);
  if (!event) return getComingSoonDisplay("Event Details", user);
  let components = [
    ...createCategoryRow("events", data, user, {}),
    separator(),
    textDisplay(`# ${event.name}`),
    ...(event.imageUrl ? [mediaGallery(mediaGalleryItem(event.imageUrl))] : []),
    separator(),
    textDisplay(`Instances: ${event.instances?.length || 0}`),
  ];
  return { flags: MessageFlags.IsComponentsV2, components };
}

export function getItemsListDisplay(data: SkyPlannerData.TransformedData, user?: string, page: number = 1) {
  return displayPaginatedList({
    title: "Items",
    items: data?.items ?? [],
    data,
    user,
    tab: "items",
    page,
    itemLabelFn: (i) => i.name,
    itemDescFn: (i) => `${i.type || ""}`,
    itemGuidFn: (i) => i.guid,
  });
}

export function getItemDisplay(itemId: string, data: SkyPlannerData.TransformedData, user?: string) {
  const item = data?.items.find((i) => i.guid === itemId);
  if (!item) return getComingSoonDisplay("Item Details", user);
  let components = [
    ...createCategoryRow("items", data, user, {}),
    separator(),
    textDisplay(`# ${item.name}`),
    ...(item.previewUrl ? [mediaGallery(mediaGalleryItem(item.previewUrl))] : []),
    separator(),
    textDisplay(`Type: ${item.type || ""}`),
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
    // @ts-expect-error cos not implemented yet
    tab: "search",
    page: 1,
    itemLabelFn: (r) => `${r.type}: ${r.name}`,
    itemDescFn: (r) => `GUID: ${r.guid}`,
    itemGuidFn: (r) => r.guid,
  });
}

export function getFavoritesDisplay(user?: string, data?: any) {
  // TODO: implement user favorites
  return getComingSoonDisplay("Favorites", user);
}

export function getSeasonInListDisplay(season: SkyPlannerData.ISeason, user?: string) {
  const totalcosts = season.spirits?.reduce(
    (acc, spirit) => {
      if (!spirit.tree?.node) return acc;
      const costs = SkyPlannerData.calculateCost(spirit.tree.node);
      for (const key of Object.keys(acc)) {
        acc[key as keyof typeof acc] += costs[key as keyof typeof costs] ?? 0;
      }
      return acc;
    },
    { h: 0, c: 0, ac: 0, sc: 0, sh: 0, ec: 0 },
  );
  const formatted = totalcosts && SkyPlannerData.formatCosts(totalcosts);

  const descriptions: [string, ...string[]] = [
    `${formatDateTimestamp(season.date)} - End: ${formatDateTimestamp(season.endDate)} (${formatDateTimestamp(season.endDate, "R")})`,
    season.spirits.map((s) => (s.icon ? `<:${s.name.split(/[\s'\-,]+/).join("")}:${s.icon}>` : "")).join(" "),
    formatted ?? "",
  ];

  return [
    section(
      {
        type: ComponentType.Button,
        label: "View Season",
        custom_id: store
          .serialize(CustomId.PlannerTopLevelNav, {
            tab: Utils.encodeCustomId({ id: "12", tab: "season", item: season.guid }),
            user,
          })
          .toString(),
        style: 1,
      },
      `### ${season.icon ? `<:${season.shortName.split(/[\s'\-,]+/).join("")}:${season.icon}>` : ""} **${season.name}**`,
    ),
    season.imageUrl ? section(thumbnail(season.imageUrl), ...descriptions) : textDisplay(...descriptions),
    separator(),
  ];
}
