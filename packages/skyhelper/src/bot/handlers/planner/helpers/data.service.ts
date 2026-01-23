import { currency, emojis, zone } from "@skyhelperbot/constants";
import { DateTime } from "luxon";
import type { IIAP } from "skygame-data";
import type { INode } from "skygame-data";
import type { ICost, IItemListNode } from "skygame-data";
import type { ISkyData } from "skygame-data";

export class PlannerDataService {
  /**
   * Deep clone object while preserving class instances like DateTime
   *
   * @remarks Structured clone breaks custom class instances, like DateTime, so here's this
   */
  static deepClone<T>(obj: T, visited = new WeakMap()): T {
    // Handle primitives and null
    if (obj === null || typeof obj !== "object") return obj;

    // Preserve special class instances
    // instanceof check may not hold true bcz data is from another package
    // DateTime
    if (typeof obj === "object" && obj.constructor.name === "DateTime") return obj as T;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    // return as is (this is for <ISkyData>.guids) since we rarely use this for progress related stuff, it is fine
    if (obj instanceof Map) return obj as T;

    // Check if we've already cloned this object (circular reference)
    if (visited.has(obj as object)) {
      return visited.get(obj as object) as T;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      const arrClone = [] as unknown as T;
      visited.set(obj as object, arrClone);
      (obj as unknown as unknown[]).forEach((item, index) => {
        (arrClone as unknown[])[index] = this.deepClone(item, visited);
      });
      return arrClone;
    }

    // Handle objects
    const cloned = {} as T;
    visited.set(obj as object, cloned);

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = this.deepClone(obj[key], visited);
      }
    }

    return cloned;
  }

  /** Resolve unlocked/bought/gifted, etc base on user progress */
  static resolveProgress(data: ISkyData, userData?: UserPlannerData) {
    if (!userData) return data;
    const d = this.deepClone(data);
    const unlockedSet = this.parseGuidSet(userData.unlocked);
    const wingedLightsSet = this.parseGuidSet(userData.wingedLights);
    const favouritesSet = this.parseGuidSet(userData.favourites);
    const giftedSet = this.parseGuidSet(userData.gifted);

    // items
    d.items.items.forEach((item) => {
      item.unlocked = unlockedSet.has(item.guid);
      item.favourited = favouritesSet.has(item.guid);
    });

    // nodes
    d.nodes.items.forEach((node) => {
      node.unlocked = unlockedSet.has(node.guid);
    });

    // iaps
    d.iaps.items.forEach((iap) => {
      const isUnlocked = unlockedSet.has(iap.guid);
      const isGifted = giftedSet.has(iap.guid);

      iap.bought = isUnlocked && !isGifted;
      iap.gifted = isGifted;
    });

    // itemLists
    d.itemLists.items.forEach((itemList) => {
      itemList.items.forEach((itemNode) => {
        itemNode.unlocked = unlockedSet.has(itemNode.guid);
        itemNode.item.unlocked = unlockedSet.has(itemNode.item.guid);
      });
    });

    // winged lights
    d.wingedLights.items.map((wl) => {
      wl.unlocked = wingedLightsSet.has(wl.guid);
    });

    return d;
  }

  /**
   * Calculate progress statistics for a user
   * @param data The enriched planner data
   * @returns Progress statistics
   */
  static calculateUserProgress(data: ISkyData) {
    const itemsTotal = data.items.items.length;
    const itemsUnlocked = data.items.items.filter((i) => i.unlocked).length;

    const nodesTotal = data.nodes.items.length;
    const nodesUnlocked = data.nodes.items.filter((n) => n.unlocked).length;

    const wingedLightsTotal = data.wingedLights.items.length;
    const wingedLightsUnlocked = data.wingedLights.items.filter((wl) => wl.unlocked).length;

    const iapsTotal = data.iaps.items.length;
    const iapsBought = data.iaps.items.filter((iap) => (iap.bought ?? false) || (iap.gifted ?? false)).length;

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
   * Formats user currencies with corresponding cost emojis
   */
  static userCurrencyToEmoji(data: ISkyData, storageData: UserPlannerData): string {
    const { candles, hearts, seasonCurrencies, eventCurrencies, ascendedCandles, giftPasses } = storageData.currencies;

    const seasonEntries = Object.entries(seasonCurrencies);
    const eventEntries = Object.entries(eventCurrencies);

    const parts = [
      `${candles} <:Candle:${currency.c}>`,
      `${hearts} <:Heart:${currency.h}>`,
      `${ascendedCandles} <:AC:${currency.ac}>`,
      `${giftPasses} <:GiftPass:${emojis.spicon}>`,
    ];

    if (seasonEntries.length > 0) {
      const seasonText = seasonEntries
        .map(([guid, sc]) => {
          const season = data.seasons.items.find((s) => s.guid === guid);
          return `${season?.emoji ? `<:${season.shortName}:${season.emoji}>` : (season?.shortName ?? "")}: ${sc.candles} <:SeasonCandle:${currency.sc}> ${sc.hearts ?? 0} <:SeasonHeart:${currency.sh}>`;
        })
        .join("\n  - ");
      parts.push(`\n- Seasonal Currencies\n  - ${seasonText}`);
    }

    if (eventEntries.length > 0) {
      const eventText = eventEntries
        .map(([guid, ev]) => {
          const event = data.eventInstances.items.find((e) => e.guid === guid);
          return `**${event?.shortName ?? event?.name ?? event?.event.shortName ?? event?.event.name ?? "Unknown"}**: ${ev.tickets} <:EventTicket:${currency.ec}>`;
        })
        .join("\n  - ");
      parts.push(`\n- Event Currencies\n  - ${eventText}`);
    }

    return parts.join(" ");
  }

  /**
   * Formats unlocked items summary
   */
  static formatUnlockedItems(usrdata: ISkyData): string {
    const progress = this.calculateUserProgress(usrdata);
    const items = [
      progress.items.unlocked > 0 ? `${progress.items.unlocked} items` : null,
      progress.iaps.bought > 0 ? `${progress.iaps.bought} IAPs` : null,
      progress.wingedLights.unlocked > 0 ? `${progress.wingedLights.unlocked} Winged Lights` : null,
      progress.nodes.unlocked > 0 ? `${progress.nodes.unlocked} Spirit Tree Nodes` : null,
    ]
      .filter(Boolean)
      .map((s) => `**${s}**`);

    return items.length > 0 ? items.join(", ") : "No items unlocked";
  }

  /**
   * Calculate currency breakdown for all unlocked items
   * Groups spent currencies by category: total, regular, seasons, events
   */
  static calculateCurrencyBreakdown(data: ISkyData): IBreakdownData {
    const createEmptyInstance = (): IBreakdownInstanceCost => ({
      cost: { c: 0, h: 0, sc: 0, sh: 0, ac: 0, ec: 0 },
      price: 0,
      nodes: [],
      listNodes: [],
      iaps: [],
    });

    const breakdown: IBreakdownData = {
      total: createEmptyInstance(),
      regular: createEmptyInstance(),
      seasons: new Map(),
      events: new Map(),
      eventInstances: new Map(),
    };

    const addCostToInstance = (instance: IBreakdownInstanceCost, cost: ICost) => {
      instance.cost.c = (instance.cost.c ?? 0) + (cost.c ?? 0);
      instance.cost.h = (instance.cost.h ?? 0) + (cost.h ?? 0);
      instance.cost.sc = (instance.cost.sc ?? 0) + (cost.sc ?? 0);
      instance.cost.sh = (instance.cost.sh ?? 0) + (cost.sh ?? 0);
      instance.cost.ac = (instance.cost.ac ?? 0) + (cost.ac ?? 0);
      instance.cost.ec = (instance.cost.ec ?? 0) + (cost.ec ?? 0);
    };

    const processNode = (node: INode, instance: IBreakdownInstanceCost) => {
      addCostToInstance(instance, node);
      instance.nodes.push(node);
    };

    const processListNode = (listNode: IItemListNode, instance: IBreakdownInstanceCost) => {
      addCostToInstance(instance, listNode);
      instance.listNodes.push(listNode);
    };

    const processIAP = (iap: IIAP, instance: IBreakdownInstanceCost) => {
      instance.price += iap.price ?? 0;
      instance.iaps.push(iap);
    };

    // Process unlocked nodes
    for (const node of data.nodes.items) {
      if (!node.unlocked) continue;

      const tree = node.root?.tree;
      const eventInstance = tree?.eventInstanceSpirit?.eventInstance;
      const season = tree?.spirit?.season;

      if (eventInstance) {
        // Event instance node
        const event = eventInstance.event;

        // Get or create event instance entry
        if (!breakdown.eventInstances.has(eventInstance.guid)) {
          breakdown.eventInstances.set(eventInstance.guid, createEmptyInstance());
        }
        processNode(node, breakdown.eventInstances.get(eventInstance.guid)!);

        // Get or create event entry
        if (!breakdown.events.has(event.guid)) {
          breakdown.events.set(event.guid, createEmptyInstance());
        }
        processNode(node, breakdown.events.get(event.guid)!);
      } else if (season) {
        // Season node
        if (!breakdown.seasons.has(season.guid)) {
          breakdown.seasons.set(season.guid, createEmptyInstance());
        }
        processNode(node, breakdown.seasons.get(season.guid)!);
      } else {
        // Regular node
        processNode(node, breakdown.regular);
      }

      // Add to total
      processNode(node, breakdown.total);
    }

    // Process unlocked item list nodes (shops)
    for (const itemList of data.itemLists.items) {
      const season = itemList.shop?.season;
      const eventInstance = itemList.shop?.event;

      for (const listNode of itemList.items) {
        if (!listNode.unlocked) continue;

        if (eventInstance) {
          const event = eventInstance.event;

          if (!breakdown.eventInstances.has(eventInstance.guid)) {
            breakdown.eventInstances.set(eventInstance.guid, createEmptyInstance());
          }
          processListNode(listNode, breakdown.eventInstances.get(eventInstance.guid)!);

          if (!breakdown.events.has(event.guid)) {
            breakdown.events.set(event.guid, createEmptyInstance());
          }
          processListNode(listNode, breakdown.events.get(event.guid)!);
        } else if (season) {
          if (!breakdown.seasons.has(season.guid)) {
            breakdown.seasons.set(season.guid, createEmptyInstance());
          }
          processListNode(listNode, breakdown.seasons.get(season.guid)!);
        } else {
          processListNode(listNode, breakdown.regular);
        }

        processListNode(listNode, breakdown.total);
      }
    }

    // Process bought IAPs
    for (const iap of data.iaps.items) {
      if (!iap.bought && !iap.gifted) continue;
      if (iap.gifted) continue; // Skip gifted IAPs from cost calculation

      const season = iap.shop?.season;
      const eventInstance = iap.shop?.event;

      if (eventInstance) {
        const event = eventInstance.event;

        if (!breakdown.eventInstances.has(eventInstance.guid)) {
          breakdown.eventInstances.set(eventInstance.guid, createEmptyInstance());
        }
        processIAP(iap, breakdown.eventInstances.get(eventInstance.guid)!);

        if (!breakdown.events.has(event.guid)) {
          breakdown.events.set(event.guid, createEmptyInstance());
        }
        processIAP(iap, breakdown.events.get(event.guid)!);
      } else if (season) {
        if (!breakdown.seasons.has(season.guid)) {
          breakdown.seasons.set(season.guid, createEmptyInstance());
        }
        processIAP(iap, breakdown.seasons.get(season.guid)!);
      } else {
        processIAP(iap, breakdown.regular);
      }

      processIAP(iap, breakdown.total);
    }

    return breakdown;
  }

  /**
   * Parse a comma-separated string into a Set of GUIDs
   */
  static parseGuidSet(value?: string): Set<string> {
    if (!value || value.length === 0) return new Set();
    return new Set(value.split(",").filter((s) => s.length > 0));
  }

  /**
   * Check if todays dailies was done
   */
  static hasDoneDailies(data = PlannerDataService.createEmpty(), guid: string, type: "season" | "event" | "dailies") {
    const checkins = data[`${type}.checkin`] ?? {};
    const date = typeof checkins === "string" ? checkins : checkins[guid];
    return date ? DateTime.now().setZone(zone).hasSame(DateTime.fromISO(date, { zone }), "day") : false;
  }

  /**
   * Serialize a Set of GUIDs into a comma-separated string
   */
  static serializeGuidSet(set: Set<string>): string {
    return Array.from(set).join(",");
  }

  /**
   * Add GUIDs to a comma-separated string
   */
  static addToGuidString(current = "", ...guids: string[]): string {
    const set = this.parseGuidSet(current);
    guids.forEach((guid) => set.add(guid));
    return this.serializeGuidSet(set);
  }

  /**
   * Remove GUIDs from a comma-separated string
   */
  static removeFromGuidString(current = "", ...guids: string[]): string {
    const set = this.parseGuidSet(current);
    guids.forEach((guid) => set.delete(guid));
    return this.serializeGuidSet(set);
  }

  /**
   * Check if a GUID exists in a comma-separated string
   */
  static hasGuid(value = "", guid: string): boolean {
    return this.parseGuidSet(value).has(guid);
  }

  /**
   * Create an empty UserPlannerData object
   */
  static createEmpty(): UserPlannerData {
    return {
      date: new Date().toISOString(),
      currencies: {
        candles: 0,
        hearts: 0,
        ascendedCandles: 0,
        giftPasses: 0,
        eventCurrencies: {},
        seasonCurrencies: {},
      },
      unlocked: "",
      wingedLights: "",
      favourites: "",
      seasonPasses: "",
      gifted: "",
      keys: {},
    };
  }

  /** Has todays shards cleared */
  static shardsCleared(plannerData?: UserPlannerData) {
    return Boolean(
      plannerData?.["shards.checkin"] &&
        DateTime.now().setZone(zone).hasSame(DateTime.fromISO(plannerData["shards.checkin"], { zone }), "day"),
    );
  }

  /** Check if provided cost object doesn't have any costs */
  static isEmptyCost(cost: ICost): boolean {
    return !cost.c && !cost.h && !cost.sc && !cost.sh && !cost.ac && !cost.ec;
  }
}

export interface UserPlannerData {
  date: string;
  currencies: IPlannerCurrencies;
  /** Comma-separated list of unlocked item/node GUIDs */
  unlocked: string;
  /** Comma-separated list of unlocked winged light GUIDs */
  wingedLights: string;
  /** Comma-separated list of favorited item GUIDs */
  favourites: string;
  /** Comma-separated list of season GUIDs for which user has season pass */
  seasonPasses: string;
  /** Comma-separated list of gifted IAP/season pass GUIDs */
  gifted: string;
  /** Extra datas related to planner */
  keys: Record<string, any>;

  /** Check-in for shards when user have cleared them */
  "shards.checkin"?: string;

  /** Check-in for when users have done dailies */
  "season.checkin"?: Record<string, string>;

  /** Check-in for when users have done dailies */
  "event.checkin"?: Record<string, string>;

  /** Dailies checkin when season is not active */
  "dailies.checkin"?: string;
}

export interface IPlannerCurrencies {
  candles: number;
  hearts: number;
  ascendedCandles: number;
  giftPasses: number;
  eventCurrencies: Record<string, { tickets: number }>;
  seasonCurrencies: Record<string, { candles: number; hearts?: number }>;
}

/**
 * Currency breakdown interfaces for tracking spent resources
 */
export interface IBreakdownInstanceCost {
  cost: ICost;
  price: number;
  nodes: INode[];
  listNodes: IItemListNode[];
  iaps: IIAP[];
}

export interface IBreakdownData {
  total: IBreakdownInstanceCost;
  regular: IBreakdownInstanceCost;
  seasons: Map<string, IBreakdownInstanceCost>;
  events: Map<string, IBreakdownInstanceCost>;
  eventInstances: Map<string, IBreakdownInstanceCost>;
}
