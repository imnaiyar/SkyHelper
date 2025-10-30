import { emojis, realms_emojis, type SkyPlannerData } from "@skyhelperbot/constants";
import {
  type _Nullable,
  type APIButtonComponent,
  type APIButtonComponentWithCustomId,
  type APIComponentInContainer,
} from "discord-api-types/v10";
import { currencyMap } from "@skyhelperbot/constants/skygame-planner";
import { CustomId, store } from "@/utils/customId-store";
import Utils from "@/utils/classes/Utils";
import { button, container, row, textDisplay } from "@skyhelperbot/utils";
import type { DateTime } from "luxon";
import type { Awaitable } from "@/types/utils";
import type { ResponseData } from "@/utils/classes/InteractionUtil";
import { FilterManager, type CustomFilterConfigs, OrderMappings } from "./filter.manager.js";
import { ComponentType } from "@discordjs/core";
import type { UserSchema } from "@/types/schemas";
import type { SkyHelper } from "@/structures";
import { DisplayTabs, FilterType, PlannerAction, type IPaginatedProps, type NavigationState } from "@/types/planner";

const CATEGORY_EMOJI_MAP = {
  [DisplayTabs.Home]: realms_emojis.Home,
  [DisplayTabs.Realms]: realms_emojis["Isle of Dawn"],
  [DisplayTabs.Events]: emojis.eventticket,
  [DisplayTabs.WingedLights]: emojis.wingwedge,
  [DisplayTabs.Items]: "1412842595737931859", // Memory whisperer cape icon
  [DisplayTabs.Shops]: emojis.shopcart,
  [DisplayTabs.Spirits]: emojis.realmelders,
};

const IGNORED_TABS = [DisplayTabs.Favourite, DisplayTabs.Profile];

export abstract class BasePlannerHandler {
  public filterManager?: FilterManager;
  protected customFilterConfigs?: CustomFilterConfigs;

  constructor(
    public data: SkyPlannerData.PlannerAssetData,
    public planner: typeof SkyPlannerData,
    public state: NavigationState,
    public settings: UserSchema,
    public client: SkyHelper,
  ) {}

  /**
   * Initialize filter manager with supported filter types for this display
   * Should be called by child classes to enable filtering
   */
  protected initializeFilters(supportedFilters: FilterType[], customConfigs?: CustomFilterConfigs): void {
    this.customFilterConfigs = customConfigs;
    this.filterManager = new FilterManager(this.data, this.state.f, supportedFilters, customConfigs);
    this.supportedFilters = supportedFilters;
  }

  /** Supported filter types for this display */
  protected supportedFilters: FilterType[] = [];

  /** Main handle method for each tab display, this should be overriden in the child classes */
  handle(): Awaitable<ResponseData> {
    return {
      components: [container(this.createTopCategoryRow(this.state.t, this.state.user), textDisplay("Coming Soon"))], // Placeholde
    };
  }
  /** Create a button row for pagination */
  paginationBtns({ page, total, ...rest }: NavigationState & { page: number; total: number }) {
    return row(
      button({
        label: "« First",
        custom_id: this.createCustomId({ ...rest, p: 1, i: "x" }),
        disabled: page === 1,
      }),
      button({
        label: "‹ Previous",
        custom_id: this.createCustomId({ ...rest, p: Math.max(1, page - 1) }),
        disabled: page === 1,
      }),
      button({
        label: `Page ${page}/${total}`,
        custom_id: "dummy_pagination_info" + Math.floor(Math.random() * 100) /* Prevents duplication erros */,
        disabled: true,
      }),
      button({
        label: "Next ›",
        custom_id: this.createCustomId({ ...rest, p: Math.min(total, page + 1) }),
        disabled: page === total,
      }),
      button({
        label: "Last »",
        custom_id: this.createCustomId({ ...rest, p: total, i: "y" }),
        disabled: page === total,
      }),
    );
  }

  /** Create buttons row for navigating between top level categories */
  createTopCategoryRow(selected: DisplayTabs, user?: string, back?: { page?: number }) {
    const BUTTONS_PER_ROW = 5;
    const seasonIcon = this.planner.getCurrentSeason(this.data)?.emoji ?? this.data.seasons[0]?.emoji;
    const categoryButtons = Object.entries(DisplayTabs)
      .map(([title, category]) => {
        if (IGNORED_TABS.includes(category)) return null; // we don't want this to show up on main planner
        const icon =
          category === DisplayTabs.Seasons ? seasonIcon : CATEGORY_EMOJI_MAP[category as keyof typeof CATEGORY_EMOJI_MAP];

        return button({
          label: back && category === selected ? "Back" : title,
          custom_id: this.createCustomId({
            t: category,
            it: null,
            p: back?.page ?? 1,
            user,
          }),
          emoji: icon ? { id: icon } : undefined,
          style: category === selected ? (back ? 4 : 3) : 2,
          disabled: category === selected && !back,
        });
      })
      .filter((s) => !!s);

    const rows = [];
    for (let i = 0; i < categoryButtons.length; i += BUTTONS_PER_ROW) {
      rows.push(row(categoryButtons.slice(i, i + BUTTONS_PER_ROW)));
    }

    return rows;
  }

  createTopCategorySelect(selected: DisplayTabs, user?: string) {
    return row({
      type: ComponentType.StringSelect,
      custom_id: store.serialize(CustomId.PlannerSelectNav, { user }),
      placeholder: "Select category",
      options: Object.entries(DisplayTabs)
        .map(([label, category]) => {
          if (IGNORED_TABS.includes(category)) return null; // we don't want this to show up on main planner
          const icon =
            category === DisplayTabs.Seasons
              ? (this.planner.getCurrentSeason(this.data)?.emoji ?? this.data.seasons[0]?.emoji)
              : CATEGORY_EMOJI_MAP[category as keyof typeof CATEGORY_EMOJI_MAP];
          return {
            label,
            value: category,
            default: category === selected,
            emoji: icon ? { id: icon } : undefined,
          };
        })
        .filter((s) => !!s),
    });
  }

  /** Formats planner dates to discord unix timestamp */
  formatDateTimestamp(date: string | Record<"day" | "month" | "year", number> | DateTime, style?: string) {
    return `<t:${Math.floor(this.planner.resolveToLuxon(date).toMillis() / 1000)}${style ? `:${style}` : ""}>`;
  }

  /** Returns a paginated list of given items */
  displayPaginatedList<T>(opt: IPaginatedProps<T>, state?: Partial<NavigationState>) {
    const { items, page: p, perpage = 5, itemCallback } = opt;
    let page = p ?? this.state.p ?? 1;
    const total = Math.max(1, Math.ceil(items.length / perpage));
    const startIndex = (page - 1) * perpage;
    const endIndex = Math.min(startIndex + perpage, items.length);
    const displayedItems: T[] = items.slice(startIndex, endIndex);
    const components: APIComponentInContainer[] = [];
    if (opt.scrollTo) {
      const item = opt.scrollTo(items);
      const index = items.indexOf(item);
      if (index !== -1) {
        page = Math.floor(index / perpage) + 1;
      }
    }
    for (const [i, item] of displayedItems.entries()) {
      components.push(...itemCallback(item, i));
    }
    // only include if there are multiple pages, may even help save comp limits
    if (total > 1) {
      components.push(
        this.paginationBtns({
          page,
          total,
          ...this.state,
          f: this.filterManager?.serializeFilters() ?? this.state.f, // fallback if a specific tab is not using filters manager
          ...state,
        }),
      );
    }

    return components;
  }

  createCustomId(opt: Partial<_Nullable<NavigationState>>) {
    /** Check if provided tab is different from current, and reset extra tab specific fields if they are not given */
    const redirect = (data: any) => ((opt.t && this.state.t !== opt.t) || (opt.it && this.state.it !== opt.it) ? null : data);

    const {
      t = this.state.t,
      user = this.state.user,
      p = redirect(this.state.p),
      it = redirect(this.state.it),
      f = redirect(this.filterManager?.serializeFilters() ?? this.state.f),
      b = redirect(this.state.b),
      d = redirect(this.state.d),
      i = redirect(this.state.i),
    } = opt;

    return store.serialize(CustomId.PlannerTopLevelNav, {
      t: t ?? this.state.t,
      it,
      p,
      f,
      d,
      i,
      r: Math.floor(Math.random() * 1e3).toString(),
      back: b ? Utils.encodeCustomId({ ...b }) : null,
      user,
    });
  }

  formatemoji(id?: string, name?: string) {
    if (!id) return "";
    if (/^<a?:\w+:\d{17,19}>$/.test(id)) return id;
    return `<:${name ? name.replaceAll(/[^\w]+/g, "") : "_"}:${id}>`;
  }

  /** Return view button for a an item, given a customid */
  viewbtn(customid: string, opt?: Partial<Omit<APIButtonComponentWithCustomId, "type">>) {
    return button({ label: "View", style: 1, custom_id: customid, ...opt });
  }
  backbtn(custom_id: string, opt?: Partial<Omit<APIButtonComponentWithCustomId, "type">>) {
    return button({ label: "Back", style: 4, custom_id, emoji: { id: emojis.leftarrow }, ...opt });
  }
  homebtn() {
    return button({
      label: "Home",
      style: 4,
      custom_id: this.createCustomId({ p: null, it: null, f: null, d: null, b: null }),
      emoji: { id: realms_emojis.Home },
    });
  }

  /**
   * Create a filter button that opens the unified filter modal
   */
  protected createFilterButton(label = "Filters"): APIButtonComponent {
    if (!this.filterManager || this.supportedFilters.length === 0) {
      throw new Error("Filter manager not initialized. Call initializeFilters() first.");
    }

    const filterStrings = this.supportedFilters.map((filter) => {
      const values = this.filterManager!.getFilterValues(filter);
      return values.length > 0 ? `${filter}:${values.join(",")}` : filter;
    });

    return button({
      label,
      style: 2,
      custom_id: store.serialize(CustomId.PlannerFilters, {
        tab: Utils.encodeCustomId({
          t: this.state.t,
          it: this.state.it ?? null,
          d: this.state.d ?? null,
          i: this.state.i ?? null,
        }),
        filters: filterStrings,
        user: this.state.user,
      }),
      emoji: { id: emojis.filter },
    });
  }

  /**
   * Create filter indicator text showing active filters
   */
  protected createFilterIndicator(): string | null {
    if (!this.filterManager) return null;

    const activeFilters: string[] = [];

    for (const filterType of this.supportedFilters) {
      const values = this.filterManager.getFilterValues(filterType);
      const type = Object.keys(FilterType).find((k) => FilterType[k as keyof typeof FilterType] === filterType);
      if (values.length > 0) {
        activeFilters.push(`${type ?? "Unknown Filter"}: \`${this.formatFilterValues(filterType, values).join("|")}\``);
      }
    }

    return activeFilters.length > 0 ? `-# Filters: ${activeFilters.join(" • ")}` : null;
  }

  /** Formats filter values to readable words */
  private formatFilterValues(filterType: FilterType, values: string[]) {
    switch (filterType) {
      case FilterType.Realms: {
        const formatted = values.map((v) => this.data.realms.find((r) => r.guid === v)?.shortName ?? v);
        return formatted;
      }
      case FilterType.Events: {
        const formatted = values.map((v) => {
          const event = this.data.events.find((r) => r.guid === v);
          return event?.shortName ?? event?.name ?? v;
        });
        return formatted;
      }
      case FilterType.Seasons: {
        const formatted = values.map((v) => {
          const season = this.data.seasons.find((r) => r.guid === v);
          return season?.shortName ?? season?.name ?? v;
        });
        return formatted;
      }
      case FilterType.Currencies: {
        const formatted = values.map((v) => (currencyMap as Record<string, string>)[v] ?? v);
        return formatted;
      }
      case FilterType.Order: {
        const formatted = values.map((v) => (OrderMappings as Record<string, string>)[v] ?? v);
        return formatted;
      }
      case FilterType.Areas: {
        const formatted = values.map((v) => this.data.areas.find((a) => a.guid === v)?.name ?? v);
        return formatted;
      }
      default:
        return values;
    }
  }

  /**
   * Update filters from new filter string (called when returning from filter modal)
   */
  protected updateFilters(newFilterString: string): void {
    if (!this.filterManager) {
      this.filterManager = new FilterManager(this.data, newFilterString, [], this.customFilterConfigs);
    } else {
      this.filterManager = new FilterManager(this.data, newFilterString, [], this.customFilterConfigs);
    }

    // Update the state
    this.state.f = newFilterString || undefined;
  }

  /**
   * Get current filter manager instance
   */
  protected getFilterManager(): FilterManager | undefined {
    return this.filterManager;
  }

  /**
   * Check if any filters are currently active
   */
  protected hasActiveFilters(): boolean {
    return !!this.filterManager && this.filterManager.serializeFilters().length > 0;
  }
}
