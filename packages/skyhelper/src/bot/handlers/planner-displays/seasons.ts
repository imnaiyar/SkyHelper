import type { SkyPlannerData } from "@skyhelperbot/constants";
import { BasePlannerHandler, DisplayTabs } from "./base.js";
import { container, section, separator, textDisplay, thumbnail } from "@skyhelperbot/utils";
import { ComponentType } from "discord-api-types/v10";

export class SeasonsDisplay extends BasePlannerHandler {
  override handle() {
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
}
