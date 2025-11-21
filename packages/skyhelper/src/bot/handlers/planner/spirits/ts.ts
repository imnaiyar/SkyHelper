import { BaseSpiritsDisplay } from "./base.js";
import { FilterType, OrderType } from "@/types/planner";
import { section, button, container } from "@skyhelperbot/utils";
import { CostUtils } from "../helpers/cost.utils.js";
export class TSDisplay extends BaseSpiritsDisplay {
  constructor(data: any, state: any, settings: any, client: any) {
    super(data, state, settings, client);
    this.initializeFilters([FilterType.Order], { [FilterType.Order]: { defaultValues: [OrderType.DateDesc] } });
  }
  override handle() {
    return {
      components: [
        container(this.topComponents(`Traveling Spirits (${this.data.travelingSpirits.items.length})`), ...this.tslist()),
      ],
    };
  }
  tslist() {
    const filtered = this.filterManager!.filterSpirits(this.data.travelingSpirits.items);
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
              i: `tree${t.tree.guid}`,
              b: { t: this.state.t, p: this.state.p, it: "", f: this.state.f, d: this.state.d },
            }),
            style: 1,
          }),
          `**${this.formatemoji(t.spirit.emoji, t.spirit.name)} ${t.spirit.name} (#${t.number})**`,
          `From ${this.formatDateTimestamp(t.date)} to ${this.formatDateTimestamp(t.endDate ?? t.date.plus({ day: 3 }))}`,
          CostUtils.treeToCostEmoji(t.tree) ?? "",
          "\u200b", // o-width for visual spacing, not using separator to save comp limit,
        ),
      ],
    });
  }
}
