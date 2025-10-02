import {
  button,
  container,
  generateSpiritTree,
  mediaGallery,
  mediaGalleryItem,
  row,
  section,
  textDisplay,
  thumbnail,
  separator,
} from "@skyhelperbot/utils";
import { BasePlannerHandler, DisplayTabs } from "./base.js";
import { FilterType, serializeFilters } from "./filter.manager.js";
import { ComponentType, type APIComponentInContainer, type APIContainerComponent } from "discord-api-types/v10";
import { emojis, type SkyPlannerData } from "@skyhelperbot/constants";
import type { RawFile } from "@discordjs/rest";
import { spiritTreeDisplay } from "./shared.js";

export class EventsDisplay extends BasePlannerHandler {
  constructor(data: any, planner: any, state: any) {
    super(data, planner, state);
    // Initialize filters for events display
    this.initializeFilters([FilterType.Order]);
  }
  override async handle() {
    const components: APIContainerComponent[] = [];
    let attachments: RawFile | undefined;
    if (this.state.it) {
      const event = this.data.events.find((e) => e.guid === this.state.it);
      if (!event) throw new Error("Event not found");
      this.state.d ??= event.instances?.[0]?.guid ?? undefined;
      const display = await this.eventDisplay(event);
      attachments = display.attachment;
      components.push(container(display.components));
    } else {
      const order = this.filterManager!.getFilterValues(FilterType.Order)[0];
      const events = order ? this.sortEvents(this.data.events, order) : this.data.events;
      components.push(
        container(
          textDisplay(`# Events (${events.length})`, this.createFilterIndicator() ?? ""),
          row(this.createFilterButton("Filter"), this.homebtn()),
          separator(),
          ...this.eventslist(events),
        ),
      );
    }

    return { components, files: attachments ? [attachments] : undefined };
  }

  eventslist(events: SkyPlannerData.IEvent[]) {
    return this.displayPaginatedList({
      items: events,
      page: this.state.p ?? 1,
      perpage: 6,
      user: this.state.user,
      itemCallback: (event) => [
        section(
          this.viewbtn(
            this.createCustomId({ it: event.guid, b: { t: DisplayTabs.Events, f: this.state.f, p: this.state.p ?? 1 } }),
          ),
          `**${event.name}**`,
          [event.instances?.map((i) => this.planner.resolveToLuxon(i.date).year.toString()), event.recurring ? "Recurring" : ""]
            .filter((s) => !!s)
            .flat()
            .join(" • "),
          "\u200b", // o-width for visual spacing, not using separator to save comp limit,
        ),
      ],
    });
  }

  async eventDisplay(event: SkyPlannerData.IEvent) {
    const instanceButtons = event.instances?.length
      ? event.instances.map((instance) =>
          button({
            custom_id: this.createCustomId({ d: instance.guid }),
            label: this.planner.resolveToLuxon(instance.date).year.toString(),
            disabled: this.state.d === instance.guid,
          }),
        )
      : [];

    instanceButtons.push(this.backbtn(this.createCustomId({ it: "", f: "", d: "", ...this.state.b })), this.homebtn());
    const rows =
      instanceButtons.length > 0
        ? Array.from({ length: Math.ceil(instanceButtons.length / 5) }, (_, i) => row(instanceButtons.slice(i * 5, i * 5 + 5)))
        : [];
    const instance = event.instances?.find((e) => e.guid === this.state.d);

    const totalCosts = instance
      ? this.planner.formatGroupedCurrencies(
          [
            instance.spirits.map((s) => s.tree),

            /* Items bought by candles in shops */
            instance.shops.flatMap((sh) => sh.itemList?.items).filter(Boolean) as SkyPlannerData.IItemListNode[],
          ].flat(),
        )
      : null;
    const subs = [
      `## ${event.name}`,
      instance ? `From ${this.formatDateTimestamp(instance.date)} to ${this.formatDateTimestamp(instance.date)}` : null,
      totalCosts && `Total Cost: ${totalCosts}`,
    ].filter(Boolean) as [string, ...string[]];

    const i_display = instance ? await this.getinstancedisplay(instance) : null;

    return {
      attachment: i_display?.attachment,
      components: [
        event.imageUrl ? section(thumbnail(event.imageUrl), ...subs) : textDisplay(...subs),
        ...rows,
        i_display ? i_display.components : null,
      ]
        .filter((s) => !!s)
        .flat(),
    };
  }

  async getinstancedisplay(instance: SkyPlannerData.IEventInstance) {
    const [start] = [this.planner.resolveToLuxon(instance.date), this.planner.resolveToLuxon(instance.endDate)];
    const index = this.state.v?.[0] ? parseInt(this.state.v[0]) : 0;
    const spirit = instance.spirits.length ? instance.spirits[index] : null;
    const selectRow = row({
      type: ComponentType.StringSelect,
      custom_id: this.createCustomId({}),
      options: instance.spirits.map((s, i) => ({
        label: s.name ?? s.spirit.name,
        value: i.toString(),
        default: index === i,
      })),
      placeholder: "Select Spirit",
    });

    const gen = spirit?.tree ? await spiritTreeDisplay(spirit.tree, this) : null;

    return {
      attachment: gen?.file ?? undefined,
      components: [
        section(
          this.viewbtn(
            this.createCustomId({
              t: DisplayTabs.Shops,
              f: serializeFilters(new Map([[FilterType.Shops, instance.shops.map((s) => s.guid)]])),
              d: "shops",
              b: { t: DisplayTabs.Events, it: this.state.it, f: this.state.f },
            }),
            { label: "Shop", emoji: { id: emojis.shopcart } },
          ),
          `## ${instance.name ?? ""} Year ${start.year}`,
        ),
        instance.spirits.length > 1 ? selectRow : null,

        ...(gen ? gen.components : []),
      ].filter((s) => !!s),
    };
  }
  private sortEvents(evs: SkyPlannerData.IEvent[], order: string) {
    const events = [...evs]; // shallow clone to prevent modifying org arr
    switch (order) {
      case "name_asc":
        return events.sort((a, b) => a.name.localeCompare(b.name));
      case "name_desc":
        return events.sort((a, b) => b.name.localeCompare(a.name));
      case "date_asc":
        return events.sort((a, b) => {
          const aDate = a.instances?.[0]?.date;
          const bDate = b.instances?.[0]?.date;
          if (!aDate && !bDate) return 0;
          if (!aDate) return 1;
          if (!bDate) return -1;
          return this.planner.resolveToLuxon(aDate).toMillis() - this.planner.resolveToLuxon(bDate).toMillis();
        });
      case "date_desc":
        return events.sort((a, b) => {
          const aDate = a.instances?.[0]?.date;
          const bDate = b.instances?.[0]?.date;
          if (!aDate && !bDate) return 0;
          if (!aDate) return 1;
          if (!bDate) return -1;
          return this.planner.resolveToLuxon(bDate).toMillis() - this.planner.resolveToLuxon(aDate).toMillis();
        });
      default:
        return events;
    }
  }
}
