import { emojis, realms_emojis, type SkyPlannerData } from "@skyhelperbot/constants";
import { type APIComponentInContainer } from "discord-api-types/v10";
import { CustomId, store } from "@/utils/customId-store";
import Utils from "@/utils/classes/Utils";
import { button, row } from "@skyhelperbot/utils";
import { string } from "zod/v4";
import type { DateTime } from "luxon";

export type NavigationState = {
  /** Current page */
  page: number;
  /** Total page */
  total: number;
  /** The top level tab it should point to */
  tab: DisplayTabs;
  user?: string;

  /** Specific item it should point to */
  item?: string;

  /** Further filter, for example, spirits have `regular`, `season`, etc. This is used to navigate there */
  filter?: string;
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
};

export class BasePlannerHandler {
  constructor(
    public data: SkyPlannerData.TransformedData,
    public planner: typeof SkyPlannerData,
  ) {}

  /** Create a button row for pagination */
  paginationBtns({ page, total, tab, user, item, filter }: NavigationState & { total: number }) {
    const basetabs = { tab, item: item ?? "", filter: filter ?? "" };
    return row(
      button({
        label: "« First",
        custom_id: store
          .serialize(CustomId.PlannerTopLevelNav, {
            tab: Utils.encodeCustomId({ id: "12", page: 1, ...basetabs }),
            user,
          })
          .toString(),
        disabled: page === 1,
      }),
      button({
        label: "‹ Previous",
        custom_id: store
          .serialize(CustomId.PlannerTopLevelNav, {
            tab: Utils.encodeCustomId({ id: "12w1", ...basetabs, page: Math.max(1, page - 1) }),
            user,
          })
          .toString(),
        disabled: page === 1,
      }),
      button({
        label: `Page ${page}/${total}`,
        custom_id: "dummy_pagination_info",
        disabled: true,
      }),
      button({
        label: "Next ›",
        custom_id: store
          .serialize(CustomId.PlannerTopLevelNav, {
            tab: Utils.encodeCustomId({ id: "213", ...basetabs, page: Math.min(total, page + 1) }),
            user,
          })
          .toString(),
        disabled: page === total,
      }),
      button({
        label: "Last »",
        custom_id: store
          .serialize(CustomId.PlannerTopLevelNav, {
            tab: Utils.encodeCustomId({ id: "3049", ...basetabs, page: total }),
            user,
          })
          .toString(),
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
  displayPaginatedList<T>({ items, user, tab, perpage = 5, page = 1, itemCallback, filter }: IPaginatedProps<T>) {
    const total = Math.max(1, Math.ceil(items.length / perpage));
    const startIndex = (page - 1) * perpage;
    const endIndex = Math.min(startIndex + perpage, items.length);
    const displayedItems: T[] = items.slice(startIndex, endIndex);
    const components: APIComponentInContainer[] = [];
    for (const [i, item] of displayedItems.entries()) {
      if (itemCallback) components.push(...itemCallback(item));
    }
    components.push(this.paginationBtns({ page, total, tab, filter, user }));

    return components;
  }

  createCustomId(tab: DisplayTabs, user?: string, page?: number, item?: string, filter?: string) {
    return store.serialize(CustomId.PlannerTopLevelNav, {
      tab: Utils.encodeCustomId({
        tab,
        item: item ?? null,
        page: page ?? null,
        filter: filter ?? null,
        id: Math.floor(Math.random() * 1e3),
      }),
      user,
    });
  }

  formatemoji(id?: string, name?: string) {
    if (!id) return "";
    return `<:${name ? name.split(/[\s'\-,]+/).join("") : "_"}:${id}>`;
  }
}

interface IPaginatedProps<T> {
  /** Items to paginate */
  items: T[];
  user?: string;

  /** The tab it should point to when clicking `View <Item>` */
  tab: DisplayTabs;

  /** The current page */
  page?: number;

  /** Override default items per-page (default: `5`) */
  perpage?: number;

  /** Further filter, for example, spirits have `regular`, `season`, etc. This is used to navigate there */
  filter?: string;

  /** The callback that should return container components for each items that is to be displayed */
  itemCallback: (i: T) => APIComponentInContainer[];
}
