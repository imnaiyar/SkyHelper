import { emojis, zone } from "@skyhelperbot/constants";
import { BasePlannerHandler } from "./base.js";
import { container, row, section, separator, textDisplay, thumbnail } from "@skyhelperbot/utils";
import { ComponentType } from "discord-api-types/v10";
import { DateTime } from "luxon";
import { serializeFilters } from "./filter.manager.js";
import { spiritTreeDisplay } from "./shared.js";
import { DisplayTabs, FilterType, OrderType } from "@/types/planner";
import type { ISeason } from "skygame-data";
import { CostUtils } from "./helpers/cost.utils.js";

export class SeasonsDisplay extends BasePlannerHandler {
  constructor(data: any, state: any, settings: any, client: any) {
    super(data, state, settings, client);
    this.initializeFilters([FilterType.Order], { [FilterType.Order]: { defaultValues: [OrderType.DateDesc] } });
  }
  override handle() {
    const season = this.data.seasons.items.find((s) => s.guid === this.state.it);
    if (season) return this.seasondisplay(season);

    const filtered = this.filterSeasons(this.data.seasons.items);
    return {
      components: [
        container(
          textDisplay(`# Seasons (${filtered.length})`, this.createFilterIndicator() ?? ""),
          row(this.createFilterButton(), this.homebtn()),
          separator(),
          ...this.seasonslist(filtered),
        ),
      ],
    };
  }

  seasonslist(seasons: ISeason[]) {
    return this.displayPaginatedList({
      items: seasons,
      page: this.state.p ?? 1,
      perpage: 4,
      itemCallback: this.getSeasonInListDisplay.bind(this),
    });
  }

  getSeasonInListDisplay(season: ISeason) {
    const totalcosts = CostUtils.groupedToCostEmoji(season.spirits.filter((s) => s.tree).map((s) => s.tree!));

    const descriptions: [string, ...string[]] = [
      `From ${this.formatDateTimestamp(season.date)} to ${this.formatDateTimestamp(season.endDate)} (${this.formatDateTimestamp(season.endDate, "R")})`,
      season.spirits.map((s) => (s.emoji ? this.formatemoji(s.emoji, s.name) : "")).join(" "),
      totalcosts ?? "",
    ];

    return [
      section(
        {
          type: ComponentType.Button,
          label: "View Season",
          custom_id: this.createCustomId({ it: season.guid }),
          style: 1,
        },
        `### ${season.emoji ? this.formatemoji(season.emoji, season.shortName) : ""} **${season.name}**`,
      ),
      season.imageUrl ? section(thumbnail(season.imageUrl), ...descriptions, "\u200b") : textDisplay(...descriptions, "\u200b"),
    ];
  }

  async seasondisplay(season: ISeason) {
    const trees = [...season.spirits.map((s) => s.tree).filter((t) => !!t), ...(season.includedTrees ?? [])];
    const index = this.state.v?.[0] ? parseInt(this.state.v[0]) : 0;

    const spiritRow = row({
      type: ComponentType.StringSelect,
      custom_id: this.createCustomId({}),
      placeholder: "Select Spirit",
      options: trees.map((t, i) => ({
        label: t.spirit?.name ?? "Unknown",
        value: i.toString(),
        default: i === index,
        emoji: t.spirit?.emoji ? { id: t.spirit.emoji } : undefined,
      })),
    });
    const tree = trees[index];

    const title: [string, ...string[]] = [
      `# ${this.formatemoji(season.emoji, season.shortName)} ${season.name}`,
      `From ${this.formatDateTimestamp(season.date)} to ${this.formatDateTimestamp(season.endDate)} (${SeasonsDisplay.isActive(season) ? "Ends" : "Ended"} ${this.formatDateTimestamp(season.endDate, "R")})`,
      `Total: ${CostUtils.groupedToCostEmoji(trees)}`,
    ];

    const gen = tree ? await spiritTreeDisplay({ tree, planner: this }, { season: true }) : null;

    const components = [
      season.imageUrl ? section(thumbnail(season.imageUrl), ...title) : textDisplay(...title),
      row(
        this.viewbtn(
          this.createCustomId({
            t: DisplayTabs.Shops,
            d: "shops",
            f: serializeFilters(new Map([[FilterType.Shops, season.shops?.map((s) => s.guid) ?? []]])),
            b: { t: DisplayTabs.Seasons, it: this.state.it, f: this.state.f },
          }),
          { label: "Shop", emoji: { id: emojis.shopcart }, disabled: !season.shops?.length },
        ),
        this.backbtn(this.createCustomId({ it: null, f: null, ...this.state.b })),
        this.homebtn(),
      ),
      separator(),
      trees.length > 1 ? spiritRow : null,
      gen ? gen.components : null,
    ]
      .flat()
      .filter((s) => !!s);
    return { files: gen?.file ? [gen.file] : undefined, components: [container(components)] };
  }

  /**
   * Check if given season is active
   */
  static isActive(season: ISeason) {
    const now = DateTime.now().setZone(zone);
    return now >= season.date && now <= season.endDate;
  }

  private filterSeasons(seasons: ISeason[]) {
    const sns = [...seasons];
    const order = this.filterManager!.getFilterValues(FilterType.Order)[0];
    switch (order) {
      case "name_asc":
        return sns.sort((a, b) => a.name.localeCompare(b.name));
      case "name_desc":
        return sns.sort((a, b) => b.name.localeCompare(a.name));
      case "date_asc":
      case "date_desc":
        return sns.sort((a, b) => {
          const aDate = a.date;
          const bDate = b.date;
          return order === "date_asc" ? aDate.toMillis() - bDate.toMillis() : bDate.toMillis() - aDate.toMillis();
        });
      default:
        return sns;
    }
  }
}
