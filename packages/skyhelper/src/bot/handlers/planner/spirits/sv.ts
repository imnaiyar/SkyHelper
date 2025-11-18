import { BaseSpiritsDisplay } from "./base.js";
import { FilterType, OrderType } from "@/types/planner";
import { section, container, thumbnail, textDisplay, row, separator } from "@skyhelperbot/utils";
import { ComponentType } from "@discordjs/core";
import { spiritTreeDisplay } from "../shared.js";
import type { ISpecialVisit } from "skygame-data";
import { CostUtils } from "../helpers/cost.utils.js";
export class SpecialVisitDisplay extends BaseSpiritsDisplay {
  constructor(data: any, state: any, settings: any, client: any) {
    super(data, state, settings, client);
    // only initialize when needed, helps reduce final custom_id length when serialized
    if (!state.it) this.initializeFilters([FilterType.Order], { [FilterType.Order]: { defaultValues: [OrderType.DateDesc] } });
  }
  override async handle() {
    if (this.state.it) {
      const visit = this.data.specialVisits.items.find((sv) => sv.guid === this.state.it);
      if (visit) {
        const { components, files } = await this.svdisplay(visit);
        return { components: [container(components)], files };
      } else {
        throw new Error("Returning Spirit not found");
      }
    }
    const filtered = this.filterManager!.filterSpirits(this.data.specialVisits.items);
    return { components: [container(this.topComponents(`Special Visits (${filtered.length})`), ...this.svlist(filtered))] };
  }

  private svlist(svs: ISpecialVisit[]) {
    return this.displayPaginatedList({
      items: svs,
      perpage: 7,
      user: this.state.user,
      page: this.state.p ?? 1,
      itemCallback: (sv) => [
        section(
          // @ts-expect-error typings don't allow b and user but they exist on state.
          this.viewbtn(this.createCustomId({ it: sv.guid, d: "sv", b: { ...this.state, user: null, b: null, v: undefined } })),
          [
            `# ${sv.name ?? "Special Visit"}`,
            `-# ${sv.spirits.map((s) => `**${this.formatemoji(s.spirit.emoji, s.spirit.name)} ${s.spirit.name}**`).join(" | ")}`,
            `From ${this.formatDateTimestamp(sv.date)} to ${this.formatDateTimestamp(sv.endDate)} (${this.formatDateTimestamp(sv.endDate, "R")})`,
            CostUtils.groupedToCostEmoji(sv.spirits.map((s) => s.tree)),
          ].join("\n"),
        ),
      ],
    });
  }

  private async svdisplay(sv: ISpecialVisit) {
    const title = [
      `# ${sv.name ?? "Special Visit"}`,
      `-# ${sv.spirits.map((s) => `**${this.formatemoji(s.spirit.emoji, s.spirit.name)} ${s.spirit.name}**`).join(" | ")}`,
      `From ${this.formatDateTimestamp(sv.date)} to ${this.formatDateTimestamp(sv.endDate)} (${this.formatDateTimestamp(sv.endDate, "R")})`,
      CostUtils.groupedToCostEmoji(sv.spirits.map((s) => s.tree)),
    ].join("\n");

    const selected = parseInt(this.state.v?.[0] ?? "0");
    const spirit = sv.spirits[selected]!;

    const { file, components } = await spiritTreeDisplay(
      { tree: spirit.tree, planner: this },
      { spiritSubtitle: sv.name ?? "Special Visit" },
    );
    return {
      components: [
        sv.imageUrl ? section(thumbnail(sv.imageUrl), title) : textDisplay(title),
        row(
          [
            this.state.b ? this.backbtn(this.createCustomId({ ...this.state.b, it: null, b: null })) : null,
            this.homebtn(),
          ].filter((c) => !!c),
        ),
        separator(true, 1),
        textDisplay("## Spirits"),
        row({
          type: ComponentType.StringSelect,
          custom_id: this.createCustomId({}),
          options: sv.spirits.map((s, i) => ({
            label: s.spirit.name,
            value: i.toString(),
            default: i === selected,
            emoji: s.spirit.emoji ? { id: s.spirit.emoji } : undefined,
          })),
        }),
        ...components,
      ],
      files: [file],
    };
  }
}
