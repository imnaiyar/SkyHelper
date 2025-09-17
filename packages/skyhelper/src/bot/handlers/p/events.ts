import { button, container, row, section, textDisplay, thumbnail } from "@skyhelperbot/utils";
import { BasePlannerHandler, DisplayTabs } from "./base.js";
import type { APIComponentInContainer, APIContainerComponent } from "discord-api-types/v10";
import { emojis, type SkyPlannerData } from "@skyhelperbot/constants";

export class EventsDisplay extends BasePlannerHandler {
  override handle() {
    const components: APIContainerComponent[] = [];
    if (this.state.item) {
      const event = this.data.events.find((e) => e.guid === this.state.item);
      if (!event) throw new Error("Event not found");
      this.state.filter ??= event.instances?.[0].guid || undefined;
      components.push(container(this.eventDisplay(event)));
    } else components.push(container(this.createTopCategoryRow(DisplayTabs.Events, this.state.user), ...this.eventslist()));

    return { components };
  }

  eventslist() {
    const events = this.data.events;
    return this.displayPaginatedList({
      items: events,
      page: this.state.page ?? 1,
      perpage: 7,
      user: this.state.user,
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

  eventDisplay(event: SkyPlannerData.IEvent) {
    const instanceButtons = event.instances?.length
      ? event.instances.map((instance) =>
          button({
            custom_id: this.createCustomId({ filter: instance.guid }),
            label: this.planner.resolveToLuxon(instance.date).year.toString(),
            disabled: this.state.filter === instance.guid,
          }),
        )
      : [];

    const rows =
      instanceButtons.length > 0
        ? Array.from({ length: Math.ceil(instanceButtons.length / 5) }, (_, i) => row(instanceButtons.slice(i * 5, i * 5 + 5)))
        : [];
    const instance = event.instances?.find((e) => e.guid === this.state.filter);
    return [
      event.imageUrl ? section(thumbnail(event.imageUrl), `## ${event.name}`) : textDisplay(`## ${event.name}`),
      ...rows,
      instance ? this.getinstancedisplay(instance) : null,
    ]
      .filter(Boolean)
      .flat() as APIComponentInContainer[];
  }

  getinstancedisplay(instance: SkyPlannerData.IEventInstance) {
    const [start, end] = [this.planner.resolveToLuxon(instance.date), this.planner.resolveToLuxon(instance.endDate)];
    const totalCosts = this.planner.formatGroupedCurrencies(
      [
        instance.spirits.map((s) => s.tree),

        /* Items bought by candles in shops */
        instance.shops.flatMap((sh) => sh.itemList?.items).filter(Boolean) as SkyPlannerData.IItemListNode[],
      ].flat(),
    );
    return [
      section(
        this.viewbtn(
          this.createCustomId({
            tab: DisplayTabs.Shops,
            item: instance.shops.map((s) => s.guid).join(","),
            back: { tab: DisplayTabs.Events, item: this.state.item, filter: this.state.filter },
          }),
          { label: "Shop", emoji: { id: emojis.shopcart } },
        ),
        `## ${instance.name || ""} Year ${start.year}`,
        `From ${this.formatDateTimestamp(start)} to ${this.formatDateTimestamp(end)}`,
        totalCosts,
      ),
    ];
  }
}
