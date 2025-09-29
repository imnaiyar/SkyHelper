import { type SkyPlannerData as p, emojis, season_emojis } from "@skyhelperbot/constants";
import { SpiritType, ItemType } from "@skyhelperbot/constants/skygame-planner";
import { type APISelectMenuOption } from "@discordjs/core";
/* eslint-disable @typescript-eslint/no-dynamic-delete */ // this is fine here
export enum FilterType {
  SpiritTypes = "spiritTypes",
  Realms = "realms",
  Seasons = "seasons",
  Events = "events",
  Order = "order",
  ItemTypes = "itemTypes",
  ShopTypes = "shopTypes",
  Currencies = "currencies",
}

export type FilterValue = string | string[];

export interface FilterConfig {
  type: FilterType;
  label: string;
  description?: string;
  defaultValues?: string[];
  required?: boolean;
  multiSelect?: boolean;
  options: APISelectMenuOption[];
}

export type ParsedFilters = Record<string, string[]>;

/**
 * Unified filter manager for planner displays
 * Provides standardized filtering capabilities across all planner displays
 */
export class FilterManager {
  private data: p.TransformedData;
  private filters: ParsedFilters = {};

  constructor(data: p.TransformedData, initialFilters?: string) {
    this.data = data;
    if (initialFilters) {
      this.parseFilters(initialFilters);
    }
  }

  /**
   * Parse filter string into structured filters
   * * Format "spiritTypes:regular,season/realms:isle,prairie"
   */
  private parseFilters(filterString: string): void {
    if (!filterString) return;

    const parts = filterString.split("/");
    this.filters = {};

    for (const part of parts) {
      const [key, values] = part.split(":");
      if (key && values) {
        this.filters[key] = values.split(",").filter(Boolean);
      }
    }
  }

  /**
   * Serialize current filters back to string format
   */
  public serializeFilters(filters?: ParsedFilters): string {
    const parts: string[] = [];

    for (const [key, values] of Object.entries(filters ?? this.filters)) {
      if (values.length > 0) {
        parts.push(`${key}:${values.join(",")}`);
      }
    }

    return parts.join("/");
  }

  /**
   * Get current filter values for a specific filter type
   */
  public getFilterValues(type: FilterType): string[] {
    return this.filters[type] ?? [];
  }

  /**
   * Set filter values for a specific type
   */
  public setFilterValues(type: FilterType, values: string[]): void {
    if (values.length > 0) {
      this.filters[type] = values;
    } else {
      delete this.filters[type];
    }
  }

  /**
   * Toggle a specific filter value
   */
  public toggleFilterValue(type: FilterType, value: string): void {
    const current = this.filters[type] ?? [];
    const index = current.indexOf(value);

    if (index > -1) {
      // remove if exists
      this.filters[type] = current.filter((v) => v !== value);
      if (this.filters[type].length === 0) {
        delete this.filters[type];
      }
    } else {
      // add if doesn't exis
      this.filters[type] = [...current, value];
    }
  }

  /**
   * Check if a filter value is active
   */
  public isFilterActive(type: FilterType, value: string): boolean {
    return this.getFilterValues(type).includes(value);
  }

  /**
   * Clear all filters
   */
  public clearFilters(): void {
    this.filters = {};
  }

  /**
   * Clear specific filter type
   */
  public clearFilter(type: FilterType): void {
    delete this.filters[type];
  }

  /**
   * Get predefined filter configurations
   */
  public static getFilterConfigs(types: FilterType[]): FilterConfig[] {
    const configs: FilterConfig[] = [];

    // This will be populated with actual data when needed
    // For now, returning structure
    for (const type of types) {
      configs.push(FilterManager.createFilterConfig(type));
    }

    return configs;
  }

  /**
   * Create filter configuration for a specific type
   */
  private static createFilterConfig(type: FilterType): FilterConfig {
    switch (type) {
      case FilterType.SpiritTypes:
        return {
          type: FilterType.SpiritTypes,
          label: "Spirit Types",
          description: "Filter by spirit types",
          multiSelect: true,
          options: [
            { label: "Regular", value: SpiritType.Regular, emoji: { id: emojis.regularspirit } },
            { label: "Seasonal", value: SpiritType.Season, emoji: { id: season_emojis.Gratitude } },
            { label: "Elder", value: SpiritType.Elder, emoji: { id: emojis.realmelders } },
            { label: "Guide", value: SpiritType.Guide, emoji: { id: emojis.auroraguide } },
          ],
        };

      case FilterType.Realms:
        return {
          type: FilterType.Realms,
          label: "Realms",
          description: "Filter by realms",
          multiSelect: true,
          options: [], // Wwll be populated with actual realm data
        };

      case FilterType.Seasons:
        return {
          type: FilterType.Seasons,
          label: "Seasons",
          description: "Filter by seasons",
          multiSelect: true,
          options: [], // will be populated with actual season data
        };

      case FilterType.Events:
        return {
          type: FilterType.Events,
          label: "Events",
          description: "Filter by events",
          multiSelect: true,
          options: [], // will be populated with actual event data
        };

      case FilterType.Order:
        return {
          type: FilterType.Order,
          label: "Sort Order",
          description: "Sort order for results",
          multiSelect: false,
          options: [
            { label: "Name (A-Z)", value: "name_asc" },
            { label: "Name (Z-A)", value: "name_desc" },
            { label: "Date Added (Newest)", value: "date_desc" },
            { label: "Date Added (Oldest)", value: "date_asc" },
          ],
        };

      case FilterType.ItemTypes:
        return {
          type: FilterType.ItemTypes,
          label: "Item Types",
          description: "Filter by item types",
          multiSelect: true,
          options: Object.entries(ItemType).map(([k, v]) => ({
            label: k,
            value: v,
          })),
        };

      case FilterType.ShopTypes:
        return {
          type: FilterType.ShopTypes,
          label: "Shop Types",
          description: "Filter by shop types",
          multiSelect: true,
          options: [
            { label: "Regular Shop", value: "regular" },
            { label: "IAP", value: "iap" },
            { label: "Special Offers", value: "special" },
          ],
        };
      case FilterType.Currencies:
        return {
          type: FilterType.Currencies,
          label: "Currency",
          description: "Filter by required currency of an item",
          multiSelect: true,
          options: [
            { label: "Candles", value: "c" },
            { label: "Hearts", value: "h" },
            { label: "Ascended Candles", value: "ac" },
            { label: "Event Tickets", value: "ec" },
            { label: "Season Hearts", value: "sh" },
            { label: "Season Candles", value: "sc" },
          ],
        };

      default:
        throw new Error(`Unknown filter type: ${type}`);
    }
  }

  /**
   * Populate filter config options with actual data from planner
   */
  public populateFilterConfig(config: FilterConfig): FilterConfig {
    switch (config.type) {
      case FilterType.Realms:
        config.options = this.data.realms.map((realm) => ({
          label: realm.name,
          value: realm.guid /*
          emoji: { id: realm.icon }, */, // todo later
        }));
        break;

      case FilterType.Seasons:
        config.options = this.data.seasons
          .map((season) => ({
            label: season.name,
            value: season.guid /*
            emoji: { id: season.icon }, */, // todo later
          }))
          .slice(0, 25);
        break;

      case FilterType.Events:
        config.options = this.data.events
          .map((event) => ({
            label: event.name,
            value: event.guid,
          }))
          .slice(0, 25); // todo possible way to add more
        break;
    }

    return config;
  }

  /**
   * Apply filters to a list of spirits
   */
  public filterSpirits(spirits: p.ISpirit[]): p.ISpirit[] {
    let filtered = [...spirits];

    // type filter
    const spiritTypes = this.getFilterValues(FilterType.SpiritTypes);
    if (spiritTypes.length > 0) {
      filtered = filtered.filter((spirit) => spiritTypes.includes(spirit.type));
    }

    // realm
    const realms = this.getFilterValues(FilterType.Realms);
    if (realms.length > 0) {
      filtered = filtered.filter((spirit) => spirit.area && realms.includes(spirit.area.realm.guid));
    }

    // season
    const seasons = this.getFilterValues(FilterType.Seasons);
    if (seasons.length > 0) {
      filtered = filtered.filter((spirit) => spirit.season && seasons.includes(spirit.season.guid));
    }

    // events
    const events = this.getFilterValues(FilterType.Events);
    if (events.length > 0) {
      filtered = filtered.filter((spirit) => spirit.events?.some((event) => events.includes(event.guid)));
    }

    // sorting
    const order = this.getFilterValues(FilterType.Order)[0];
    if (order) {
      filtered = this.sortSpirits(filtered, order);
    }

    return filtered;
  }

  /**
   * Apply filters to a list of items
   */
  public filterItems(items: p.IItem[]): p.IItem[] {
    let filtered = [...items];

    // type
    const itemTypes = this.getFilterValues(FilterType.ItemTypes);
    if (itemTypes.length > 0) {
      filtered = filtered.filter((item) => itemTypes.includes(item.type));
    }

    // sorting
    const order = this.getFilterValues(FilterType.Order)[0];
    if (order) {
      filtered = this.sortItems(filtered, order);
    }

    // season
    const seasons = this.getFilterValues(FilterType.Seasons);
    if (seasons.length > 0) {
      filtered = filtered.filter((item) => item.season && seasons.includes(item.season.guid));
    }

    // events
    const events = this.getFilterValues(FilterType.Events);
    if (events.length > 0) {
      filtered = filtered.filter((item) =>
        item.nodes?.some((node) => events.includes(node.root?.spiritTree?.eventInstanceSpirit?.eventInstance?.event.guid ?? "")),
      );
    }

    return filtered;
  }

  /**
   * Sort spirits based on order criteria
   */
  private sortSpirits(spirits: p.ISpirit[], order: string): p.ISpirit[] {
    switch (order) {
      case "name_asc":
        return spirits.sort((a, b) => a.name.localeCompare(b.name));
      case "name_desc":
        return spirits.sort((a, b) => b.name.localeCompare(a.name));
      case "date_asc":
        return spirits.sort((a, b) => {
          const aDate = a.season?.date ?? a.ts?.[0]?.date ?? "0";
          const bDate = b.season?.date ?? b.ts?.[0]?.date ?? "0";
          return aDate.localeCompare(bDate);
        });
      case "date_desc":
        return spirits.sort((a, b) => {
          const aDate = a.season?.date ?? a.ts?.[0]?.date ?? "0";
          const bDate = b.season?.date ?? b.ts?.[0]?.date ?? "0";
          return bDate.localeCompare(aDate);
        });
      default:
        return spirits;
    }
  }

  /**
   * Sort items based on order criteria
   */
  private sortItems(items: p.IItem[], order: string): p.IItem[] {
    switch (order) {
      case "name_asc":
        return items.sort((a, b) => a.name.localeCompare(b.name));
      case "name_desc":
        return items.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return items;
    }
  }
}

// additionally export if needed outside class instance
export function serializeFilters(filters: ParsedFilters): string {
  const parts: string[] = [];

  for (const [key, values] of Object.entries(filters)) {
    if (values.length > 0) {
      parts.push(`${key}:${values.join(",")}`);
    }
  }

  return parts.join("/");
}
