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

export class SeasonsDisplay extends BasePlannerHandler {
  override handle() {
    const season = this.data.seasons.find((s) => s.guid === this.state.item);
    if (season) return this.seasondisplay(season);
    return {
      components: [
        container(this.createTopCategoryRow(DisplayTabs.Seasons, this.state.user), separator(), ...this.seasonslist()),
      ],
    };
  }

  seasonslist() {
    return this.displayPaginatedList({
      items: this.data.seasons,
      page: this.state.page ?? 1,
      perpage: 3, // TODO: Find a way to increase this limit
      itemCallback: this.getSeasonInListDisplay.bind(this),
    });
  }

  getSeasonInListDisplay(season: SkyPlannerData.ISeason) {
    const totalcosts = season.spirits?.reduce(
      (acc, spirit) => {
        if (!spirit.tree?.node) return acc;
        const costs = this.planner.calculateCost(spirit.tree.node);
        for (const key of Object.keys(acc)) {
          acc[key as keyof typeof acc] += costs[key as keyof typeof costs] ?? 0;
        }
        return acc;
      },
      { h: 0, c: 0, ac: 0, sc: 0, sh: 0, ec: 0 },
    );
    const formatted = totalcosts && this.planner.formatCosts(totalcosts);

    const descriptions: [string, ...string[]] = [
      `From ${this.formatDateTimestamp(season.date)} to ${this.formatDateTimestamp(season.endDate)} (${this.formatDateTimestamp(season.endDate, "R")})`,
      season.spirits.map((s) => (s.icon ? this.formatemoji(s.icon, s.name) : "")).join(" "),
      formatted ?? "",
    ];

    return [
      section(
        {
          type: ComponentType.Button,
          label: "View Season",
          custom_id: this.createCustomId({ item: season.guid }),
          style: 1,
        },
        `### ${season.icon ? this.formatemoji(season.icon, season.shortName) : ""} **${season.name}**`,
      ),
      season.imageUrl ? section(thumbnail(season.imageUrl), ...descriptions) : textDisplay(...descriptions, "\u200b"),
    ];
  }

  async seasondisplay(season: ISeason) {
    const trees = [...season.spirits.map((s) => s.tree).filter((t) => !!t), ...(season.includedTrees?.filter((t) => !!t) ?? [])];
    const [start, end] = [this.planner.resolveToLuxon(season.date), this.planner.resolveToLuxon(season.endDate)];
    const index = this.state.values?.[0] ? parseInt(this.state.values[0]) : 0;

    const spiritRow = row({
      type: ComponentType.StringSelect,
      custom_id: this.createCustomId({}),
      placeholder: "Select Spirit",
      options: trees.map((t, i) => ({
        label: t.spirit?.name || "Unknown",
        value: i.toString(),
        default: i === index,
        emoji: t.spirit?.icon ? { id: t.spirit.icon } : undefined,
      })),
    });
    const tree = trees[index];

    const title: [string, ...string[]] = [
      `# ${this.formatemoji(season.icon, season.shortName)} ${season.name}`,
      `From ${this.formatDateTimestamp(start)} to ${this.formatDateTimestamp(end)} (${SeasonsDisplay.isActive(season) ? "Ends" : "Ended"} ${this.formatDateTimestamp(end, "R")})`,
      `Total: ${this.planner.formatGroupedCurrencies(trees)}`,
    ];

    let file: RawFile | undefined;
    if (tree) {
      const buff = await generateSpiritTree(tree, { season: true });
      file = { name: "tree.png", data: buff };
    }
    const components = [
      season.imageUrl ? section(thumbnail(season.imageUrl), ...title) : textDisplay(...title),
      row(
        this.viewbtn(
          this.createCustomId({
            tab: DisplayTabs.Shops,
            item: season.shops?.map((s) => s.guid).join(","),
            back: { tab: DisplayTabs.Events, item: this.state.item, filter: this.state.filter },
          }),
          { label: "Shop", emoji: { id: emojis.shopcart }, disabled: !season.shops?.length },
        ),
        this.backbtn(this.createCustomId({ item: "", filter: "", ...this.state.back })),
        this.homebtn(),
      ),
      separator(),
      trees.length > 1 ? spiritRow : null,
      tree
        ? [
            section(
              this.viewbtn(this.createCustomId({ tab: DisplayTabs.Spirits, item: tree.spirit?.guid }), {
                label: "View",
                disabled: !tree.spirit,
              }),
              `# ${tree.spirit?.name || "Unknown"}`,
            ),
            section(
              this.viewbtn(this.createCustomId({}), { label: "Modify" }),
              this.planner.getFormattedTreeCost(tree),
              "-# Click the `Modify` button to mark/unmark items in this spirit tree as acquired",
            ),
          ]
        : null,
      tree ? mediaGallery(mediaGalleryItem("attachment://tree.png")) : null,
    ]
      .flat()
      .filter((s) => !!s);
    return { files: file ? [file] : undefined, components: [container(components)] };
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
}
