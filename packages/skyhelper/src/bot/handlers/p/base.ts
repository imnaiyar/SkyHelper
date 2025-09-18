import { emojis, realms_emojis, type SkyPlannerData } from "@skyhelperbot/constants";
import {
  type APIButtonComponent,
  type APIButtonComponentWithCustomId,
  type APIComponentInContainer,
} from "discord-api-types/v10";
import { CustomId, store } from "@/utils/customId-store";
import Utils from "@/utils/classes/Utils";
import { button, container, row, textDisplay } from "@skyhelperbot/utils";
import { string } from "zod/v4";
import type { DateTime } from "luxon";

export type NavigationState = {
  /** Current page */
  page?: number;

  /** The top level tab it should point to */
  tab: DisplayTabs;

  user?: string;

  /** Specific item it should point to */
  item?: string;

  /** Further filter, for example, spirits have `regular`, `season`, etc. This is used to navigate there */
  filter?: string;

  /** Any extra data that are passed */
  data?: string;

  /** Array of values, if it was through a string select. */
  values?: string[];

  /** Options for back button, provided when we want to redirect to somewhere else, instead of generic back
   * For ex, imagine we go to a particular area from wl tab, providing this back btn, we can come back to wl tab
   */
  back?: Omit<NavigationState, "back" | "user" | "values">;
};

export enum DisplayTabs {
  Home = "home",
  Realms = "realms",
  Spirits = "spirits",
  Seasons = "seasons",
  Events = "events",
  Items = "items",
  WingedLights = "wingedLights",
  Shops = "shops",
}

const CATEGORY_EMOJI_MAP = {
  [DisplayTabs.Home]: realms_emojis.Home,
  [DisplayTabs.Realms]: realms_emojis["Isle of Dawn"],
  [DisplayTabs.Events]: emojis.eventticket,
  [DisplayTabs.WingedLights]: emojis.wingwedge,
  [DisplayTabs.Items]: "1412842595737931859", // Memory whisperer cape icon
  [DisplayTabs.Shops]: emojis.shopcart,
  [DisplayTabs.Spirits]: emojis.realmelders,
};

export class BasePlannerHandler {
  constructor(
    public data: SkyPlannerData.TransformedData,
    public planner: typeof SkyPlannerData,
    public state: NavigationState,
  ) {}

  /** Main handle method for each tab display, this should be overriden in the child classes */
  handle() {
    return {
      components: [container(this.createTopCategoryRow(this.state.tab, this.state.user), textDisplay("Coming Soon"))], // Placeholde
    };
  }
  /** Create a button row for pagination */
  paginationBtns({ page, total, ...rest }: NavigationState & { page: number; total: number }) {
    return row(
      button({
        label: "« First",
        custom_id: this.createCustomId({ ...rest, page: 1 }),
        disabled: page === 1,
      }),
      button({
        label: "‹ Previous",
        custom_id: this.createCustomId({ ...rest, page: Math.max(1, page - 1) }),
        disabled: page === 1,
      }),
      button({
        label: `Page ${page}/${total}`,
        custom_id: "dummy_pagination_info",
        disabled: true,
      }),
      button({
        label: "Next ›",
        custom_id: this.createCustomId({ ...rest, page: Math.min(total, page + 1) }),
        disabled: page === total,
      }),
      button({
        label: "Last »",
        custom_id: this.createCustomId({ ...rest, page: total }),
        disabled: page === total,
      }),
    );
  }

  /** Create buttons row for navigating between top level categories */
  createTopCategoryRow(selected: DisplayTabs, user?: string, back?: { page?: number }) {
    const BUTTONS_PER_ROW = 4;
    const seasonIcon = this.planner.getCurrentSeason(this.data)?.icon ?? this.data.seasons[0]?.icon;
    const categoryButtons = Object.values(DisplayTabs).map((category) => {
      const icon =
        category === DisplayTabs.Seasons ? seasonIcon : CATEGORY_EMOJI_MAP[category as keyof typeof CATEGORY_EMOJI_MAP];

      return button({
        label: back && category === selected ? "Back" : category.charAt(0).toUpperCase() + category.slice(1),
        custom_id: store
          .serialize(CustomId.PlannerTopLevelNav, {
            tab: Utils.encodeCustomId({ id: "42", tab: category, item: null, page: back?.page ?? null }),
            user,
          })
          .toString(),
        emoji: icon ? { id: icon } : undefined,
        style: category === selected ? (back ? 4 : 3) : 2,
        disabled: category === selected && !back,
      });
    });

    const rows = [];
    for (let i = 0; i < categoryButtons.length; i += BUTTONS_PER_ROW) {
      rows.push(row(categoryButtons.slice(i, i + BUTTONS_PER_ROW)));
    }

    return rows;
  }

  /** Formats planner dates to discord unix timestamp */
  formatDateTimestamp(date: string | Record<"day" | "month" | "year", number> | DateTime, style?: string) {
    return `<t:${Math.floor(this.planner.resolveToLuxon(date).toMillis() / 1000)}${style ? `:${style}` : ""}>`;
  }

  /** Returns a paginated list of given items */
  displayPaginatedList<T>(opt: IPaginatedProps<T>) {
    const { items, user = this.state.user, page = this.state.page ?? 1, perpage = 5, itemCallback } = opt;
    const total = Math.max(1, Math.ceil(items.length / perpage));
    const startIndex = (page - 1) * perpage;
    const endIndex = Math.min(startIndex + perpage, items.length);
    const displayedItems: T[] = items.slice(startIndex, endIndex);
    const components: APIComponentInContainer[] = [];
    for (const [i, item] of displayedItems.entries()) {
      if (itemCallback) components.push(...itemCallback(item, i));
    }
    // only include if there are multiple pages, may even help save comp limits
    if (total > 1)
      components.push(
        this.paginationBtns({
          page,
          total,
          tab: this.state.tab,
          filter: this.state.filter,
          item: this.state.item,
          user,
          back: this.state.back,
        }),
      );

    return components;
  }

  createCustomId(opt: Partial<NavigationState>) {
    /** Check if provided tab is different from current, and reset extra tab specific fields if they are not given */
    const redirect = (data: any) =>
      (opt.tab && this.state.tab !== opt.tab) || (opt.item && this.state.item !== opt.item) ? null : data;

    const {
      tab = this.state.tab,
      user = this.state.user,
      page = redirect(this.state.page),
      item = redirect(this.state.item),
      filter = redirect(this.state.filter),
      back = redirect(this.state.back),
      data = redirect(this.state.data),
    } = opt;
    if (back && typeof back !== "object") throw new Error("Back option cannot be a primitive value");
    return store.serialize(CustomId.PlannerTopLevelNav, {
      tab: Utils.encodeCustomId({
        tab,
        item: item || null,
        page: page || null,
        filter: filter || null,
        data: data || null,
        id: Math.floor(Math.random() * 1e3),
        back: back ? JSON.stringify(back) : null,
      }),
      user,
    });
  }

  formatemoji(id?: string, name?: string) {
    if (!id) return "";
    return `<:${name ? name.replaceAll(/[\s'\-,#,),(]+/g, "") : "_"}:${id}>`;
  }

  /** Return view button for a an item, given a customid */
  viewbtn(customid: string, opt?: Partial<Omit<APIButtonComponentWithCustomId, "type">>) {
    return button({ label: "View", style: 1, custom_id: customid, ...opt });
  }
  backbtn(custom_id: string, opt?: Partial<Omit<APIButtonComponentWithCustomId, "type">>) {
    return button({ label: "Back", style: 4, custom_id, emoji: { id: emojis.leftarrow }, ...opt });
  }
}

interface IPaginatedProps<T> {
  /** Items to paginate */
  items: T[];
  user?: string;

  /** The current page */
  page?: number;

  /** Override default items per-page (default: `5`) */
  perpage?: number;
  /**
   * The callback that should return container components for each items that is to be displayed
   * @param item The item passed inside the items array
   * @param i Index of the item in the passed array
   */
  itemCallback: (item: T, i: number) => APIComponentInContainer[];
}
