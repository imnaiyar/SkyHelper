import { zone } from "@skyhelperbot/constants";
import { DateTime } from "luxon";
import type { ISpiritTree } from "skygame-data";
import type { INode } from "skygame-data";
import type { IEvent, IEventInstance, ISpirit } from "skygame-data";
import type { ISkyData } from "skygame-data";

export class PlannerService {
  /**
   * Search for entities by name across all data types
   * @param query Search query string
   * @param data The transformed data
   * @returns Array of matching entities with type, name, and guid
   */
  static searchEntitiesByName(query: string, data: ISkyData) {
    if (!query) return [];

    const searchTerms = query.toLowerCase();
    const results: Array<{ type: string; name: string; guid: string }> = [];

    // Search realms
    data.realms.items.forEach((realm) => {
      if (realm.name.toLowerCase().includes(searchTerms) || realm.shortName.toLowerCase().includes(searchTerms)) {
        results.push({ type: "Realm", name: realm.name, guid: realm.guid });
      }
    });

    // Search areas
    data.areas.items.forEach((area) => {
      if (area.name.toLowerCase().includes(searchTerms)) {
        results.push({ type: "Area", name: `${area.name} (${area.realm.name || "Unknown Realm"})`, guid: area.guid });
      }
    });

    // Search spirits
    data.spirits.items.forEach((spirit) => {
      if (spirit.name.toLowerCase().includes(searchTerms)) {
        results.push({ type: "Spirit", name: spirit.name, guid: spirit.guid });
      }
    });

    // Search seasons
    data.seasons.items.forEach((season) => {
      if (season.name.toLowerCase().includes(searchTerms) || season.shortName.toLowerCase().includes(searchTerms)) {
        results.push({ type: "Season", name: season.name, guid: season.guid });
      }
    });

    // Search events
    data.events.items.forEach((event) => {
      if (event.name.toLowerCase().includes(searchTerms)) {
        results.push({ type: "Event", name: event.name, guid: event.guid });
      }
    });

    data.items.items.forEach((item) => {
      const spiritName = item.nodes?.[0]?.root?.tree?.spirit?.name.toLowerCase() ?? "";
      const eventName = item.nodes?.[0]?.root?.tree?.eventInstanceSpirit?.eventInstance?.name?.toLowerCase() ?? "";
      if (item.name.toLowerCase().includes(searchTerms) || spiritName.includes(searchTerms) || eventName.includes(searchTerms)) {
        results.push({ type: "Item", name: item.name, guid: item.guid });
      }
    });

    data.travelingSpirits.items.forEach((ts) => {
      if (
        ts.number.toString().includes(searchTerms) ||
        ts.spirit.name.toLowerCase().includes(searchTerms) ||
        `ts${ts.number}`.includes(searchTerms) ||
        `ts #${ts.number}`.includes(searchTerms)
      ) {
        results.push({ type: `TS#${ts.number}`, name: ts.spirit.name, guid: ts.guid });
      }
    });

    data.specialVisits.items.forEach((rs) => {
      const spiritNames = rs.spirits.map((s) => s.spirit.name.toLowerCase()).join(" ");
      if (rs.name?.toLowerCase().includes(searchTerms) || spiritNames.includes(searchTerms)) {
        results.push({ type: "SV", name: rs.name ?? "Unknown", guid: rs.guid });
      }
    });

    // Search IAPs
    data.iaps.items.forEach((iap) => {
      if (iap.name?.toLowerCase().includes(searchTerms)) {
        results.push({ type: "IAP", name: iap.name, guid: iap.guid });
      }
    });

    // Search shops
    data.shops.items.forEach((shop) => {
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
  static getEntityByGuid(guid: string, data: ISkyData) {
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
      { type: "ReturningSpirit", collection: data.specialVisits },
      { type: "Shop", collection: data.shops },
      { type: "IAP", collection: data.iaps },
      { type: "WingedLight", collection: data.wingedLights },
    ];

    for (const { type, collection } of entityTypes) {
      const entity = collection.items.find((e) => e.guid === guid);
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
  static getSpiritsInRealm(realmId: string, data: ISkyData) {
    const realm = data.realms.items.find((d) => d.guid === realmId);
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
   * Get current and upcoming events
   * @param data The transformed data
   * @returns Object containing current and upcoming events
   */
  static getEvents(data: ISkyData) {
    const now = DateTime.now().setZone(zone);
    const currentEvents: Array<{ event: IEvent; instance: IEventInstance }> = [];
    const upcomingEvents: Array<{ event: IEvent; instance: IEventInstance; startDate: DateTime }> = [];

    for (const event of data.events.items) {
      for (const instance of event.instances ?? []) {
        if (now >= instance.date && now <= instance.endDate) {
          currentEvents.push({
            event,
            instance,
          });
        } else if (now < instance.date) {
          upcomingEvents.push({
            event,
            instance,
            startDate: instance.date,
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
  static getCurrentSeason(data: ISkyData) {
    const now = DateTime.now().setZone(zone);
    return data.seasons.items.find((season) => {
      return now >= season.date && now <= season.endDate;
    });
  }

  /**
   * Get currently active returning spirits
   * @param data The transformed data
   * @returns Array of currently active returning spirits
   */
  static getCurrentSpecialVisits(data: ISkyData) {
    const now = DateTime.now().setZone(zone);
    return data.specialVisits.items.filter((visit) => {
      return now >= visit.date && now <= visit.endDate;
    });
  }

  /**
   * get the current traveling spirit
   * @param data The transformed data
   * @returns The current traveling spirit or undefined if none is active
   */
  static getCurrentTravelingSpirit(data: ISkyData) {
    const now = DateTime.now().setZone(zone);
    return data.travelingSpirits.items.find((ts) => {
      return now >= ts.date && now <= ts.endDate;
    });
  }

  /** Get spirit instance that offers this node */
  static getNodeSpirit(node: INode) {
    const tree = node.root?.tree;
    return tree?.spirit ?? tree?.travelingSpirit?.spirit ?? tree?.specialVisitSpirit?.spirit ?? tree?.eventInstanceSpirit?.spirit;
  }

  /** Get spirit instance from the provided tree */
  static getTreeSpirit(tree: ISpiritTree) {
    return (
      tree.spirit ?? tree.eventInstanceSpirit?.spirit ?? tree.travelingSpirit?.spirit ?? tree.specialVisitSpirit?.spirit ?? null
    );
  }
}
