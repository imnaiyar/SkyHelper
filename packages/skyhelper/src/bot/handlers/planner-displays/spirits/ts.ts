import { BaseSpiritsDisplay } from "./base.js";
import { FilterType, OrderType } from "@/types/planner";
import { section, button, container } from "@skyhelperbot/utils";
export class TSDisplay extends BaseSpiritsDisplay {
  constructor(data: any, planner: any, state: any, settings: any, client: any) {
    super(data, planner, state, settings, client);
    this.initializeFilters([FilterType.Order], { [FilterType.Order]: { defaultValues: [OrderType.DateDesc] } });
  }
  override handle() {
    return {
      components: [container(this.topComponents(`Traveling Spirits (${this.data.travelingSpirits.length})`), ...this.tslist())],
    };
  }
  tslist() {
    const filtered = this.filterManager!.filterSpirits(this.data.travelingSpirits);
    return this.displayPaginatedList({
      items: filtered,
      user: this.state.user,
      page: this.state.p ?? 1,
      perpage: 7,
      itemCallback: (t) => [
        section(
          button({
            label: "View",
            custom_id: this.createCustomId({
              it: t.spirit.guid,
              // passing this in `i` because all the properties are used for one thing or another
              // passing other tree so that index is correctly calculated based on how it is handled in spirits display
              // TODO: eventually think of a better way to do this, maybe when the spirit tree selection is refactored
              i: `tree${[t.tree, ...(t.spirit.treeRevisions ?? []), ...(t.spirit.returns ?? []), ...(t.spirit.ts ?? [])].findIndex((x) => x.guid === t.guid).toString()}`,
              b: { t: this.state.t, p: this.state.p, it: "", f: this.state.f, d: this.state.d },
            }),
            style: 1,
          }),
          `**${this.formatemoji(t.spirit.emoji, t.spirit.name)} ${t.spirit.name} (#${t.number})**`,
          `From ${this.formatDateTimestamp(t.date)} to ${this.formatDateTimestamp(t.endDate ?? this.planner.resolveToLuxon(t.date).plus({ day: 3 }))}`,
          this.planner.getFormattedTreeCost(t.tree),
          "\u200b", // o-width for visual spacing, not using separator to save comp limit,
        ),
      ],
    });
  }
}
