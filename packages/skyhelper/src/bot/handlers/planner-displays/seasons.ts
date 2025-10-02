import { emojis, zone, type SkyPlannerData } from "@skyhelperbot/constants";
import { BasePlannerHandler, DisplayTabs } from "./base.js";
import {
  container,
  generateSpiritTree,
  mediaGallery,
  mediaGalleryItem,
  row,
  section,
  separator,
  textDisplay,
  thumbnail,
} from "@skyhelperbot/utils";
import { ComponentType } from "discord-api-types/v10";
import { resolveToLuxon, type ISeason } from "@skyhelperbot/constants/skygame-planner";
import { DateTime } from "luxon";
import type { RawFile } from "@discordjs/rest";
import { FilterType, serializeFilters } from "./filter.manager.js";
import { spiritTreeDisplay } from "./shared.js";

export class SeasonsDisplay extends BasePlannerHandler {
  constructor(data: any, planner: any, state: any) {
    super(data, planner, state);
    this.initializeFilters([FilterType.Order]);
  }
  override handle() {
    const season = this.data.seasons.find((s) => s.guid === this.state.it);
    if (season) return this.seasondisplay(season);

    const filtered = this.filterSeasons(this.data.seasons);
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

  getSeasonInListDisplay(season: SkyPlannerData.ISeason) {
    const totalcosts = season.spirits.reduce(
      (acc, spirit) => {
        if (!spirit.tree?.node) return acc;
        const costs = this.planner.calculateCost(spirit.tree.node);
        for (const key of Object.keys(acc)) {
          acc[key as keyof typeof acc] += costs[key as keyof typeof costs] || 0;
        }
        return acc;
      },
      { h: 0, c: 0, ac: 0, sc: 0, sh: 0, ec: 0 },
    );
    const formatted = this.planner.formatCosts(totalcosts);

    const descriptions: [string, ...string[]] = [
      `From ${this.formatDateTimestamp(season.date)} to ${this.formatDateTimestamp(season.endDate)} (${this.formatDateTimestamp(season.endDate, "R")})`,
      season.spirits.map((s) => (s.emoji ? this.formatemoji(s.emoji, s.name) : "")).join(" "),
      formatted,
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
      season.imageUrl ? section(thumbnail(season.imageUrl), ...descriptions) : textDisplay(...descriptions, "\u200b"),
    ];
  }

  async seasondisplay(season: ISeason) {
    const trees = [...season.spirits.map((s) => s.tree).filter((t) => !!t), ...(season.includedTrees ?? [])];
    const [start, end] = [this.planner.resolveToLuxon(season.date), this.planner.resolveToLuxon(season.endDate)];
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
      `From ${this.formatDateTimestamp(start)} to ${this.formatDateTimestamp(end)} (${SeasonsDisplay.isActive(season) ? "Ends" : "Ended"} ${this.formatDateTimestamp(end, "R")})`,
      `Total: ${this.planner.formatGroupedCurrencies(trees)}`,
    ];

    const gen = tree ? await spiritTreeDisplay(tree, this, { season: true }) : null;

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
        this.backbtn(this.createCustomId({ it: "", f: "", ...this.state.b })),
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
    const start = resolveToLuxon(season.date);
    const end = resolveToLuxon(season.endDate);
    return now >= start && now <= end;
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
        return sns.sort((a, b) => {
          const aDate = a.date;
          const bDate = b.date;
          if (!aDate && !bDate) return 0;
          if (!aDate) return 1;
          if (!bDate) return -1;
          return this.planner.resolveToLuxon(aDate).toMillis() - this.planner.resolveToLuxon(bDate).toMillis();
        });
      case "date_desc":
        return sns.sort((a, b) => {
          const aDate = a.date;
          const bDate = b.date;
          if (!aDate && !bDate) return 0;
          if (!aDate) return 1;
          if (!bDate) return -1;
          return this.planner.resolveToLuxon(bDate).toMillis() - this.planner.resolveToLuxon(aDate).toMillis();
        });
      default:
        return sns;
    }
  }
}
