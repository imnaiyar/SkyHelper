/**
 * SkyGame Planner data service
 * This file provides the main interface for accessing SkyGame Planner data
 */
import { currency, fetchEmojis, zone } from "../index.js";
import { BASE_URL, fetchAllData } from "./fetcher.js";
import type { IEvent, IEventInstance, INode, ISpirit, ISpiritTree } from "./interfaces.js";
import { transformData, type PlannerAssetData } from "./transformer.js";
import { DateTime } from "luxon";
import type { UserPlannerData } from "./interfaces.js";
import { PlannerDataHelper } from "./interfaces.js";

let cachedData: PlannerAssetData | null = null;
let lastFetchTime = 0;
const CACHE_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Gets the SkyGame Planner data, loading it from cache if available or fetching it if needed
 * @param forceRefresh Force a refresh of the data, bypassing the cache
 * @returns The transformed SkyGame Planner data
 */
export async function getSkyGamePlannerData(forceRefresh = false): Promise<PlannerAssetData> {
  const now = Date.now();
  const cacheExpired = now - lastFetchTime > CACHE_LIFETIME_MS;

  if (!cachedData || cacheExpired || forceRefresh) {
    console.log("Fetching SkyGame Planner data...");
    const fetchedData = await fetchAllData();
    await fetchEmojis();
    console.log("Transforming SkyGame Planner data...");
    cachedData = transformData(fetchedData);
    lastFetchTime = now;
    console.log("SkyGame Planner data loaded successfully");
  }

  return cachedData;
}

/**
 * Search for entities by name across all data types
 * @param query Search query string
 * @param data The transformed data
 * @returns Array of matching entities with type, name, and guid
 */
export function searchEntitiesByName(query: string, data: PlannerAssetData) {
  if (!query) return [];

  const searchTerms = query.toLowerCase();
  const results: Array<{ type: string; name: string; guid: string }> = [];

  // Search realms
  data.realms.forEach((realm) => {
    if (realm.name.toLowerCase().includes(searchTerms) || realm.shortName.toLowerCase().includes(searchTerms)) {
      results.push({ type: "Realm", name: realm.name, guid: realm.guid });
    }
  });

  // Search areas
  data.areas.forEach((area) => {
    if (area.name.toLowerCase().includes(searchTerms)) {
      results.push({ type: "Area", name: `${area.name} (${area.realm.name || "Unknown Realm"})`, guid: area.guid });
    }
  });

  // Search spirits
  data.spirits.forEach((spirit) => {
    if (spirit.name.toLowerCase().includes(searchTerms)) {
      results.push({ type: "Spirit", name: spirit.name, guid: spirit.guid });
    }
  });

  // Search seasons
  data.seasons.forEach((season) => {
    if (season.name.toLowerCase().includes(searchTerms) || season.shortName.toLowerCase().includes(searchTerms)) {
      results.push({ type: "Season", name: season.name, guid: season.guid });
    }
  });

  // Search events
  data.events.forEach((event) => {
    if (event.name.toLowerCase().includes(searchTerms)) {
      results.push({ type: "Event", name: event.name, guid: event.guid });
    }
  });

  data.items.forEach((item) => {
    const spiritName = item.nodes?.[0]?.root?.spiritTree?.spirit?.name.toLowerCase() ?? "";
    const eventName = item.nodes?.[0]?.root?.spiritTree?.eventInstanceSpirit?.eventInstance?.name?.toLowerCase() ?? "";
    if (item.name.toLowerCase().includes(searchTerms) || spiritName.includes(searchTerms) || eventName.includes(searchTerms)) {
      results.push({ type: "Item", name: item.name, guid: item.guid });
    }
  });

  data.travelingSpirits.forEach((ts) => {
    if (
      ts.number.toString().includes(searchTerms) ||
      ts.spirit.name.toLowerCase().includes(searchTerms) ||
      `ts${ts.number}`.includes(searchTerms) ||
      `ts #${ts.number}`.includes(searchTerms)
    ) {
      results.push({ type: `TS#${ts.number}`, name: ts.spirit.name, guid: ts.guid });
    }
  });

  data.returningSpirits.forEach((rs) => {
    const spiritNames = rs.spirits.map((s) => s.spirit.name.toLowerCase()).join(" ");
    if (rs.name?.toLowerCase().includes(searchTerms) || spiritNames.includes(searchTerms)) {
      results.push({ type: "SV", name: rs.name ?? "Unknown", guid: rs.guid });
    }
  });

  // Search IAPs
  data.iaps.forEach((iap) => {
    if (iap.name?.toLowerCase().includes(searchTerms)) {
      results.push({ type: "IAP", name: iap.name, guid: iap.guid });
    }
  });

  // Search shops
  data.shops.forEach((shop) => {
    if (shop.name?.toLowerCase().includes(searchTerms)) {
      results.push({ type: "Shop", name: shop.name, guid: shop.guid });
    }
  });

  return results;
}

/**
 * Get an entity by its GUID, searching across all data types
 * @param guid The GUID to look for
 * @param data The transformed data
 * @returns The entity with its type or null if not found
 */
export function getEntityByGuid(guid: string, data: PlannerAssetData) {
  // Search through all entity types
  const entityTypes = [
    { type: "Realm", collection: data.realms },
    { type: "Area", collection: data.areas },
    { type: "Spirit", collection: data.spirits },
    { type: "Season", collection: data.seasons },
    { type: "Event", collection: data.events },
    { type: "Item", collection: data.items },
    { type: "Node", collection: data.nodes },
    { type: "SpiritTree", collection: data.spiritTrees },
    { type: "TravelingSpirit", collection: data.travelingSpirits },
    { type: "ReturningSpirit", collection: data.returningSpirits },
    { type: "Shop", collection: data.shops },
    { type: "IAP", collection: data.iaps },
    { type: "WingedLight", collection: data.wingedLights },
  ];

  for (const { type, collection } of entityTypes) {
    const entity = collection.find((e) => e.guid === guid);
    if (entity) {
      return { type, data: entity };
    }
  }

  return null;
}

/**
 * Helper function to get all spirits from a specific realm
 * @param realmId The ID of the realm
 * @param data The transformed data
 * @returns Array of spirits in the realm
 */
export function getSpiritsInRealm(realmId: string, data: PlannerAssetData) {
  const realm = data.realms.find((d) => d.guid === realmId);
  if (!realm) return [];

  const spirits: ISpirit[] = [];
  for (const area of realm.areas ?? []) {
    for (const spirit of area.spirits ?? []) {
      spirits.push(spirit);
    }
  }

  return spirits;
}

/**
 * Helper function to get all winged lights in a specific realm
 * @param realmId The ID of the realm
 * @param data The transformed data
 * @returns Array of winged lights in the realm
 */
export function getWingedLightsInRealm(realmId: string, data: PlannerAssetData) {
  const realm = data.realms.find((d) => d.guid === realmId);
  if (!realm) return [];

  const wingedLights: any[] = [];
  for (const area of realm.areas ?? []) {
    for (const wl of area.wingedLights ?? []) {
      wingedLights.push(wl);
    }
  }

  return wingedLights;
}

/**
 * Helper function to get the current traveling spirit
 * @param data The transformed data
 * @returns The current traveling spirit or undefined if none is active
 */
export function getCurrentTravelingSpirit(data: PlannerAssetData) {
  const now = DateTime.now().setZone(zone);
  return data.travelingSpirits.find((ts) => {
    const startDate = resolveToLuxon(ts.date).startOf("day");
    const endDate = !ts.endDate ? startDate.plus({ day: 3 }) : resolveToLuxon(ts.endDate);
    return now >= startDate && now <= endDate.endOf("day");
  });
}

/**
 * Helper function to get all spirits from a specific season
 * @param seasonId The ID of the season
 * @param data The transformed data
 * @returns Array of spirits in the season
 */
export function getSpiritsInSeason(seasonId: string, data: PlannerAssetData) {
  const season = data.seasons.find((s) => s.guid === seasonId);
  if (!season) return [];

  return season.spirits;
}

/**
 * Helper function to get all items from a specific spirit tree
 * @param spiritId The ID of the spirit
 * @param data The transformed data
 * @returns Array of items in the spirit tree
 */
export function getItemsInSpiritTree(spiritId: string, data: PlannerAssetData) {
  const spirit = data.spirits.find((s) => s.guid === spiritId);
  if (!spirit?.tree?.node) return [];

  const items: any[] = [];

  // Recursively walk through the node tree and collect items
  function collectItems(node: any) {
    if (node.item) {
      items.push(node.item);
    }

    if (node.nw) collectItems(node.nw);
    if (node.ne) collectItems(node.ne);
    if (node.n) collectItems(node.n);
  }

  collectItems(spirit.tree.node);

  return items;
}

/**
 * Helper function to get current and upcoming events
 * @param data The transformed data
 * @returns Object containing current and upcoming events
 */
export function getEvents(data: PlannerAssetData) {
  const now = DateTime.now().setZone(zone);
  const currentEvents: Array<{ event: IEvent; instance: IEventInstance }> = [];
  const upcomingEvents: Array<{ event: IEvent; instance: IEventInstance; startDate: DateTime }> = [];

  for (const event of data.events) {
    for (const instance of event.instances ?? []) {
      const startDate = resolveToLuxon(instance.date).startOf("day");
      const endDate = resolveToLuxon(instance.endDate).endOf("day");

      if (now >= startDate && now <= endDate) {
        currentEvents.push({
          event,
          instance,
        });
      } else if (now < startDate) {
        upcomingEvents.push({
          event,
          instance,
          startDate,
        });
      }
    }
  }

  // Sort upcoming events by start date
  upcomingEvents.sort((a, b) => a.startDate.toMillis() - b.startDate.toMillis());

  return {
    current: currentEvents,
    upcoming: upcomingEvents.slice(0, 5), // Limit to 5 upcoming events
  };
}

/**
 * Get the currently active season
 * @param data The transformed data
 * @returns The current season or undefined if none is active
 */
export function getCurrentSeason(data: PlannerAssetData) {
  const now = DateTime.now().setZone(zone);
  return data.seasons.find((season) => {
    const startDate = resolveToLuxon(season.date).startOf("day");
    const endDate = resolveToLuxon(season.endDate).endOf("day");
    return now >= startDate && now <= endDate;
  });
}

/**
 * Get currently active returning spirits
 * @param data The transformed data
 * @returns Array of currently active returning spirits
 */
export function getCurrentReturningSpirits(data: PlannerAssetData) {
  const now = DateTime.now().setZone(zone);
  return data.returningSpirits.filter((visit) => {
    const startDate = resolveToLuxon(visit.date).startOf("day");
    const endDate = resolveToLuxon(visit.endDate).endOf("day");
    return now >= startDate && now <= endDate;
  });
}

/**
 * Get stats about the SkyGame Planner data
 * @param data The transformed data
 * @returns Object with statistics about the data
 */
export function getDataStats(data: PlannerAssetData) {
  return {
    realms: data.realms.length,
    areas: data.areas.length,
    spirits: data.spirits.length,
    seasons: data.seasons.length,
    items: data.items.length,
    wingedLights: data.wingedLights.length,
    travelingSpirits: data.travelingSpirits.length,
    returningSpirits: data.returningSpiritsVisits.length,
    events: data.events.length,
    totalNodes: data.nodes.length,
  };
}

export function resolveToLuxon(date: { day: number; month: number; year: number } | string | DateTime) {
  if (date instanceof DateTime) return date;
  if (typeof date === "string") {
    return DateTime.fromFormat(date, "yyyy-MM-dd", { zone });
  }
  return DateTime.fromObject(date as { day: number; month: number; year: number }, { zone });
}

/**
 * Calculate total costs of all nodes walking upwards to all the references
 */
export function calculateCost(node: INode) {
  const costs = { h: 0, c: 0, sc: 0, sh: 0, ac: 0, ec: 0 };
  const addCurrency = (type: any) => {
    for (const currencyy of Object.keys(costs)) {
      costs[currencyy as keyof typeof costs] += type[currencyy as keyof typeof costs] ?? 0;
    }
  };
  addCurrency(node);
  if (node.nw) addCurrency(calculateCost(node.nw));
  if (node.ne) addCurrency(calculateCost(node.ne));
  if (node.n) addCurrency(calculateCost(node.n));

  return costs;
}

export function formatCosts(costs: { h?: number; c?: number; sc?: number; sh?: number; ac?: number; ec?: number }) {
  const parts = [];
  if (costs.h) parts.push(`${costs.h} <:Heart:${currency.h}>`);
  if (costs.c) parts.push(`${costs.c} <:Candle:${currency.c}>`);
  if (costs.sc) parts.push(`${costs.sc} <:SeasonCandle:${currency.sc}>`);
  if (costs.sh) parts.push(`${costs.sh} <:SeasonHeart:${currency.sh}>`);
  if (costs.ac) parts.push(`${costs.ac} <:AC:${currency.ac}>`);
  if (costs.ec) parts.push(`${costs.ec} <:EventTicket:${currency.ec}>`);
  return parts.join(" ") || "Free";
}

export function getFormattedTreeCost(tree: ISpiritTree) {
  const c = calculateCost(tree.node);
  return formatCosts(c);
}

export function formatGroupedCurrencies(
  obj: Array<ISpiritTree | INode | { h?: number; c?: number; sc?: number; sh?: number; ac?: number; ec?: number }>,
) {
  const currencies = { h: 0, c: 0, sc: 0, sh: 0, ac: 0, ec: 0 };

  for (const item of obj) {
    const costs = "node" in item ? calculateCost(item.node) : calculateCost(item as INode);
    for (const key in currencies) {
      currencies[key as keyof typeof currencies] += costs[key as keyof typeof costs] || 0;
    }
  }

  return formatCosts(currencies);
}

export const resolvePlannerUrl = (url: string) => (url.startsWith("http") ? url : BASE_URL + url);

/**
 * Enrich planner data with user-specific progress information
 * @param data The base planner data
 * @param userData The user's planner progress data
 * @returns The same data object with unlocked/bought/received fields populated
 */
export function enrichDataWithUserProgress(data: PlannerAssetData, userData?: UserPlannerData): PlannerAssetData {
  if (!userData) return data;

  const unlockedSet = PlannerDataHelper.parseGuidSet(userData.unlocked);
  const wingedLightsSet = PlannerDataHelper.parseGuidSet(userData.wingedLights);
  const favouritesSet = PlannerDataHelper.parseGuidSet(userData.favourites);
  const giftedSet = PlannerDataHelper.parseGuidSet(userData.gifted);

  // Enrich items
  data.items.forEach((item) => {
    item.unlocked = unlockedSet.has(item.guid);
    item.favourited = favouritesSet.has(item.guid);
  });

  // Enrich nodes
  data.nodes.forEach((node) => {
    node.unlocked = unlockedSet.has(node.guid);
  });

  // Enrich IAPs
  data.iaps.forEach((iap) => {
    const isUnlocked = unlockedSet.has(iap.guid);
    const isGifted = giftedSet.has(iap.guid);
    iap.bought = isUnlocked && !isGifted;
    iap.gifted = isGifted;
  });

  // Enrich item list nodes
  data.itemListNodes.forEach((node) => {
    node.unlocked = unlockedSet.has(node.guid);
  });

  // Enrich winged lights
  data.wingedLights.forEach((wl) => {
    wl.unlocked = wingedLightsSet.has(wl.guid);
  });

  return data;
}

/**
 * Calculate progress statistics for a user
 * @param data The enriched planner data
 * @returns Progress statistics
 */
export function calculateUserProgress(data: PlannerAssetData) {
  const itemsTotal = data.items.length;
  const itemsUnlocked = data.items.filter((i) => i.unlocked).length;

  const nodesTotal = data.nodes.length;
  const nodesUnlocked = data.nodes.filter((n) => n.unlocked).length;

  const wingedLightsTotal = data.wingedLights.length;
  const wingedLightsUnlocked = data.wingedLights.filter((wl) => wl.unlocked).length;

  const iapsTotal = data.iaps.length;
  const iapsBought = data.iaps.filter((iap) => (iap.bought ?? false) || (iap.gifted ?? false)).length;

  return {
    items: {
      total: itemsTotal,
      unlocked: itemsUnlocked,
      percentage: itemsTotal > 0 ? Math.round((itemsUnlocked / itemsTotal) * 100) : 0,
    },
    nodes: {
      total: nodesTotal,
      unlocked: nodesUnlocked,
      percentage: nodesTotal > 0 ? Math.round((nodesUnlocked / nodesTotal) * 100) : 0,
    },
    wingedLights: {
      total: wingedLightsTotal,
      unlocked: wingedLightsUnlocked,
      percentage: wingedLightsTotal > 0 ? Math.round((wingedLightsUnlocked / wingedLightsTotal) * 100) : 0,
    },
    iaps: {
      total: iapsTotal,
      bought: iapsBought,
      percentage: iapsTotal > 0 ? Math.round((iapsBought / iapsTotal) * 100) : 0,
    },
  };
}

/**
 * Recursively get all nodes in a tree
 */
export function getAllTreeNodes(node: INode, visited = new Set<string>()) {
  if (visited.has(node.guid)) return [];

  visited.add(node.guid);
  const nodes = [node];

  if (node.n) nodes.push(...getAllTreeNodes(node.n, visited));
  if (node.nw) nodes.push(...getAllTreeNodes(node.nw, visited));
  if (node.ne) nodes.push(...getAllTreeNodes(node.ne, visited));

  return nodes;
}
