import { container, section } from "@skyhelperbot/utils";
import { BasePlannerHandler, DisplayTabs } from "./base.js";

export class EventsDisplay extends BasePlannerHandler {
  override handle() {
    return { components: [container(this.createTopCategoryRow(DisplayTabs.Events, this.state.user), ...this.eventslist())] };
  }

  eventslist() {
    const events = this.data.events;
    return this.displayPaginatedList({
      items: events,
      page: this.state.page ?? 1,
      perpage: 7,
      tab: this.state.tab,
      user: this.state.user,
      filter: this.state.filter,
      itemCallback: (event) => [
        section(
          this.viewbtn(this.createCustomId({ item: event.guid })),
          `**${event.name}**`,
          [event.instances?.map((i) => this.planner.resolveToLuxon(i.date).year.toString()), event.recurring ? "Recurring" : ""]
            .filter(Boolean)
            .flatMap((s) => s)
            .join(" • "),
          "\u200b", // o-width for visual spacing, not using separator to save comp limit,
        ),
      ],
    });
  }
}
