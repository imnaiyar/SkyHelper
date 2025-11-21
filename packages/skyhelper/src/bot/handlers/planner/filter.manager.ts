import { emojis, season_emojis } from "@skyhelperbot/constants";
import { type APISelectMenuOption } from "@discordjs/core";
import { DisplayTabs, FilterType, OrderType, SpiritType } from "@/types/planner";
import { ItemType, type ISkyData, type ISpirit } from "skygame-data";
import { currencyMap } from "./base.js";
import type { ISpecialVisit, ITravelingSpirit } from "skygame-data";
import type { IItem } from "skygame-data";
import { CostUtils } from "./helpers/cost.utils.js";

export const OrderMappings = {
  [OrderType.NameAsc]: "Name (A-Z)",
  [OrderType.NameDesc]: "Name (Z-A)",
  [OrderType.DateDesc]: "Date Added (Newest)",
  [OrderType.DateAsc]: "Date Added (Oldest)",
};
export type FilterValue = string | string[];

export interface FilterConfig {
  type: FilterType;
  label: string;
  description?: string;
  defaultValues?: string[];
  required?: boolean;
  multiSelect?: boolean;
  max?: boolean;
  options: APISelectMenuOption[];
}

export type CustomFilterConfigs = Partial<Record<FilterType, Partial<FilterConfig>>>;

export type ParsedFilters = Map<string, string[]>;

/**
 * Unified filter manager for planner displays
 * Provides standardized filtering capabilities across all planner displays
 */
export class FilterManager {
  private data: ISkyData;
  private filters: ParsedFilters = new Map();
  private customConfigs?: CustomFilterConfigs;
  private allowedFilters?: FilterType[];

  constructor(data: ISkyData, initialFilters?: string, allowedFilters?: FilterType[], customConfigs?: CustomFilterConfigs) {
    this.data = data;
    this.allowedFilters = allowedFilters;
    this.customConfigs = customConfigs;
    // fill defaults, which can be overwritten later in parseFilters
    if (this.allowedFilters) {
      const configs = this.getFilterConfigs(this.allowedFilters);
      for (const config of configs) {
        if (config.defaultValues?.length) this.filters.set(config.type, config.defaultValues);
      }
    }

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
    this.filters = new Map();

    for (const part of parts) {
      const [key, values] = part.split(":");
      if (key && values) {
        this.filters.set(key, values.split(",").filter(Boolean));
      }
    }
  }

  /**
   * Serialize current filters back to string format
   */
  public serializeFilters(filters?: ParsedFilters): string {
    const parts: string[] = [];

    for (const [key, values] of filters?.entries() ?? this.filters.entries()) {
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
    return this.filters.get(type) ?? [];
  }

  /**
   * Set filter values for a specific type
   */
  public setFilterValues(type: FilterType, values: string[]): void {
    if (values.length > 0) {
      this.filters.set(type, values);
    } else {
      this.filters.delete(type);
    }
  }

  /**
   * Toggle a specific filter value
   */
  public toggleFilterValue(type: FilterType, value: string): void {
    const current = this.filters.get(type) ?? [];
    const index = current.indexOf(value);

    if (index > -1) {
      // remove if exists
      this.filters.set(
        type,
        current.filter((v) => v !== value),
      );
      if (this.filters.get(type)?.length === 0) {
        this.filters.delete(type);
      }
    } else {
      // add if doesn't exist
      this.filters.set(type, [...current, value]);
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
    this.filters = new Map();
  }

  /**
   * Clear specific filter type
   */
  public clearFilter(type: FilterType): void {
    this.filters.delete(type);
  }

  /**
   * Get filter configurations for this manager instance
   */
  public getFilterConfigs(types: FilterType[]): FilterConfig[] {
    return FilterManager.getFilterConfigs(types, this.data, this.customConfigs);
  }

  /**
   * Get predefined filter configurations
   */
  public static getFilterConfigs(types: FilterType[], data: ISkyData, customConfigs?: CustomFilterConfigs): FilterConfig[] {
    const configs: FilterConfig[] = [];

    for (const type of types) {
      const baseConfig = FilterManager.createFilterConfig(type, data);
      if (!baseConfig) continue; // skip unknown types
      const customConfig = customConfigs?.[type];

      if (customConfig) {
        // merge configs
        configs.push({
          ...baseConfig,
          ...customConfig,
          // options should be completely replaced if provided in custom config
          options: customConfig.options ?? baseConfig.options,
        });
      } else {
        configs.push(baseConfig);
      }
    }

    return configs;
  }

  /**
   * Create filter configuration for a specific type
   */
  private static createFilterConfig(type: FilterType, data: ISkyData): FilterConfig | undefined {
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
          options: data.realms.items.map((realm) => ({
            label: realm.name,
            value: realm.guid,
            emoji: realm.emoji ? { id: realm.emoji } : undefined,
          })),
        };

      case FilterType.Seasons:
        return {
          type: FilterType.Seasons,
          label: "Seasons",
          description: "Filter by seasons",
          multiSelect: true,
          options: data.seasons.items
            .map((season) => ({
              label: season.name,
              value: season.guid,
              emoji: season.emoji ? { id: season.emoji } : undefined,
            }))
            .slice(0, 25), // TODO: find a way to include all seasons
        };

      case FilterType.Events:
        return {
          type: FilterType.Events,
          label: "Events",
          description: "Filter by events",
          multiSelect: true,
          options: data.events.items
            .map((event) => ({
              label: event.name,
              value: event.guid,
            }))
            .slice(0, 25), // TODO: same here
        };

      case FilterType.Order:
        return {
          type: FilterType.Order,
          label: "Sort Order",
          description: "Sort order for results",
          multiSelect: false,
          options: Object.entries(OrderMappings).map(([k, v]) => ({ label: v, value: k })),
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
      case FilterType.Currencies:
        return {
          type: FilterType.Currencies,
          label: "Currency",
          description: "Filter by required currency of an item",
          multiSelect: true,
          options: Object.entries(currencyMap).map(([k, v]) => ({ label: v, value: k })),
        };

      default:
        return undefined; // igonore
    }
  }

  /**
   * Default factory for creating custom filter configurations based on display tab
   * This can be overridden by display handlers that need custom configurations
   */
  public static tabsCustomConfig(_data: ISkyData, tab: DisplayTabs, _filters: string[]): CustomFilterConfigs | undefined {
    switch (tab) {
      case DisplayTabs.WingedLights: {
        return {
          [FilterType.Realms]: { max: true },
        };
      }
      case DisplayTabs.Areas:
        return {
          [FilterType.Order]: {
            options: Object.entries(OrderMappings)
              .map(([k, v]) => {
                // eslint-disable-next-line
                if (k === OrderType.DateAsc || k === OrderType.DateDesc) return null;
                return { label: v, value: k };
              })
              .filter((v) => !!v),
          },
        };
      default:
        return undefined;
    }
  }

  /**
   * Apply filters to a list of spirits
   */
  public filterSpirits<TType extends ISpirit | ITravelingSpirit | ISpecialVisit>(spirits: TType[]): TType[] {
    let filtered = [...spirits];

    // type filter
    const spiritTypes = this.getFilterValues(FilterType.SpiritTypes);
    if (spiritTypes.length > 0) {
      filtered = filtered.filter((spirit) => "type" in spirit && spiritTypes.includes(spirit.type));
    }

    // realm
    const realms = this.getFilterValues(FilterType.Realms);
    if (realms.length > 0) {
      filtered = filtered.filter((spirit) => "area" in spirit && realms.includes(spirit.area?.realm.guid ?? ""));
    }

    // season
    const seasons = this.getFilterValues(FilterType.Seasons);
    if (seasons.length > 0) {
      filtered = filtered.filter((spirit) => "season" in spirit && seasons.includes(spirit.season?.guid ?? ""));
    }

    // events
    const events = this.getFilterValues(FilterType.Events);
    if (events.length > 0) {
      filtered = filtered.filter(
        (spirit) =>
          "eventInstanceSpirits" in spirit &&
          spirit.eventInstanceSpirits?.some((event) => events.includes(event.eventInstance?.event.guid ?? "")),
      );
    }

    // sorting
    const order = this.getFilterValues(FilterType.Order)[0];
    if (order) {
      filtered = this.sortSpirits(filtered, order);
    }

    const areas = this.getFilterValues(FilterType.Areas);
    if (areas.length > 0) {
      filtered = filtered.filter((spirit) => "area" in spirit && areas.includes(spirit.area?.guid ?? ""));
    }

    return filtered;
  }

  /**
   * Apply filters to a list of items
   */
  public filterItems(items: IItem[]): IItem[] {
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
        item.nodes?.some((node) => events.includes(node.root?.tree?.eventInstanceSpirit?.eventInstance?.event.guid ?? "")),
      );
    }
    const currencies = this.getFilterValues(FilterType.Currencies);
    if (currencies.length > 0) {
      filtered = filtered.filter((item) => item.nodes?.some((node) => currencies.includes(CostUtils.getCostKey(node) ?? "")));
    }

    return filtered;
  }

  /**
   * Sort spirits based on order criteria
   */
  private sortSpirits<TType extends ISpirit | ITravelingSpirit | ISpecialVisit>(sprts: TType[], order: string): TType[] {
    const spirits = [...sprts];
    const getSpirit = (spirit: TType): ISpirit | null => {
      if ("spirit" in spirit) return spirit.spirit;
      if ("spirits" in spirit) return null; // this is rs, so no 1 spirit, ignore
      return spirit;
    };

    switch (order) {
      case "name_asc":
        return spirits.sort((a, b) => {
          const nameA = "name" in a ? (a.name ?? "") : (getSpirit(a)?.name ?? "");
          const nameB = "name" in b ? (b.name ?? "") : (getSpirit(b)?.name ?? "");
          return nameA.localeCompare(nameB);
        });
      case "name_desc":
        return spirits.sort((a, b) => {
          const nameA = "name" in a ? (a.name ?? "") : (getSpirit(a)?.name ?? "");
          const nameB = "name" in b ? (b.name ?? "") : (getSpirit(b)?.name ?? "");
          return nameB.localeCompare(nameA);
        });
      case "date_asc":
        return spirits.sort((a, b) => {
          const aDate = "date" in a ? a.date : (a.season?.date ?? a.travelingSpirits?.[0]?.date);
          const bDate = "date" in b ? b.date : (b.season?.date ?? b.travelingSpirits?.[0]?.date);
          if (!aDate && !bDate) return 0;
          if (!aDate) return 1;
          if (!bDate) return -1;
          return aDate.toMillis() - bDate.toMillis();
        });
      case "date_desc":
        return spirits.sort((a, b) => {
          const aDate = "date" in a ? a.date : (a.season?.date ?? a.travelingSpirits?.[0]?.date);
          const bDate = "date" in b ? b.date : (b.season?.date ?? b.travelingSpirits?.[0]?.date);
          if (!aDate && !bDate) return 0;
          if (!aDate) return 1;
          if (!bDate) return -1;
          return bDate.toMillis() - aDate.toMillis();
        });
      default:
        return spirits;
    }
  }

  /**
   * Sort items based on order criteria
   */
  private sortItems(itms: IItem[], order: string): IItem[] {
    const items = [...itms];
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

  for (const [key, values] of filters.entries()) {
    if (values.length > 0) {
      parts.push(`${key}:${values.join(",")}`);
    }
  }

  return parts.join("/");
}
