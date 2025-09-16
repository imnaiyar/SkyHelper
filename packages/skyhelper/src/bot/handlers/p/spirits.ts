import { emojis, SkyPlannerData as p, SkyPlannerData, season_emojis } from "@skyhelperbot/constants";
import { BasePlannerHandler, DisplayTabs } from "./base.js";
import { button, container, row, section, separator } from "@skyhelperbot/utils";
import { CustomId, store } from "@/utils/customId-store";
import Utils from "@/utils/classes/Utils";
import type { APIComponentInContainer } from "discord-api-types/v10";

const SpiritNav = [p.SpiritType.Regular, p.SpiritType.Season, p.SpiritType.Elder, p.SpiritType.Guide, "TS"] as const;
const emojisMap = {
  [p.SpiritType.Regular]: emojis.regularspirit,
  [p.SpiritType.Season]: season_emojis.Gratitude,
  [p.SpiritType.Elder]: emojis.realmelders,
  [p.SpiritType.Guide]: emojis.auroraguide,
  ["TS"]: emojis.travelingspirit,
} as const;

export class SpiritsDisplay extends BasePlannerHandler {
  override handle() {
    const spirits = this.data.spirits;
    this.state.filter ??= SpiritNav[0]; // set filter to regular if not present
    const filternav = SpiritNav.map((s, i) =>
      button({
        label: s,
        custom_id: store
          .serialize(CustomId.PlannerTopLevelNav, {
            tab: Utils.encodeCustomId({ tab: "spirits", filter: s, page: this.state.page ?? 1, id: i }),
            user: this.state.user,
          })
          .toString(),
        emoji: { id: emojisMap[s] },
        style: this.state.filter === s ? 3 : 2,
        disabled: this.state.filter === s,
      }),
    );
    const uppercomponent = (title: string) => [
      row(filternav),
      section(
        button({
          label: "Home",
          custom_id: this.createCustomId({ tab: DisplayTabs.Home }),
          style: 4,
          emoji: { id: emojis.leftarrow },
        }),
        `# ${title}`,
      ),
      separator(),
    ];

    const components: APIComponentInContainer[] = [];

    switch (this.state.filter) {
      case p.SpiritType.Regular:
      case p.SpiritType.Season:
      case p.SpiritType.Elder:
      case p.SpiritType.Guide:
        const spiritsOfType = spirits.filter((s) => s.type === this.state.filter);
        components.push(...uppercomponent(`${this.state.filter} Spirits (${spiritsOfType.length})`));
        components.push(
          ...this.displayPaginatedList({
            items: spiritsOfType,
            user: this.state.user,
            filter: this.state.filter,
            page: this.state.page ?? 1,
            tab: DisplayTabs.Spirits,
            perpage: 7,
            itemCallback: (s) => this.spiritInList(s, { page: this.state.page, filter: this.state.filter }),
          }),
        );
        break;
      case "TS":
        components.push(...uppercomponent(`Traveling Spirits (${this.data.travelingSpirits.length})`));
        components.push(...this.tslist());
        break;
    }

    return { components: [container(components)] };
  }

  tslist() {
    const ts = this.data.travelingSpirits;
    return this.displayPaginatedList({
      items: [...ts].reverse(),
      user: this.state.user,
      page: this.state.page ?? 1,
      filter: "TS",
      tab: DisplayTabs.Spirits,
      perpage: 7,
      itemCallback: (t) => [
        section(
          button({
            label: "View",
            custom_id: this.createCustomId({ item: t.guid, filter: "TS" }),
            style: 1,
          }),
          `**${this.formatemoji(t.spirit.icon, t.spirit.name)} ${t.spirit.name} (#${t.number})**`,
          `From ${this.formatDateTimestamp(t.date)} to ${this.formatDateTimestamp(t.endDate ? t.endDate : this.planner.resolveToLuxon(t.date).plus({ day: 3 }))}`,
          this.planner.getFormattedTreeCost(t.tree),
          "\u200b", // o-width for visual spacing, not using separator to save comp limit,
        ),
      ],
    });
  }

  spiritInList(spirit: SkyPlannerData.ISpirit, back?: { page?: number; filter?: string }) {
    return [
      section(
        button({
          custom_id: this.createCustomId({
            tab: DisplayTabs.Spirits,
            page: back?.page,
            item: spirit.guid,
            filter: SpiritNav.includes(spirit.type as any) ? spirit.type : (back?.filter ?? p.SpiritType.Regular),
          }),
          style: 1,
          label: "View",
        }),
        `## ${this.formatemoji(spirit.icon, spirit.name)} ${spirit.name}`,
        [
          spirit.type,
          spirit.area
            ? this.formatemoji(spirit.area.realm.icon, spirit.area.realm.shortName) + ` ${spirit.area.realm.shortName}`
            : null,
          spirit.season ? this.formatemoji(spirit.season.icon, spirit.season.name) + ` ${spirit.season.shortName}` : null,
        ]
          .filter(Boolean)
          .join(" \u2022 "),
        spirit.tree ? this.planner.getFormattedTreeCost(spirit.tree) : "",
        "\u200b", // o-width for visual spacing, not using separator to save comp limit,,
      ),
    ];
  }
}

export type SpiritListOptions = {
  filter: string;
  page?: number;
  user?: string;
  /** Guid of the spirit, if displaying one specific spirit */
  spirit?: string;
};
