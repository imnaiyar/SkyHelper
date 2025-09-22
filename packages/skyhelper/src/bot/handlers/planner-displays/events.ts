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
} from "@skyhelperbot/utils";
import { BasePlannerHandler, DisplayTabs } from "./base.js";
import { ComponentType, type APIComponentInContainer, type APIContainerComponent } from "discord-api-types/v10";
import { emojis, type SkyPlannerData } from "@skyhelperbot/constants";
import type { RawFile } from "@discordjs/rest";

export class EventsDisplay extends BasePlannerHandler {
  override async handle() {
    const components: APIContainerComponent[] = [];
    let attachements: RawFile | undefined;
    if (this.state.item) {
      const event = this.data.events.find((e) => e.guid === this.state.item);
      if (!event) throw new Error("Event not found");
      this.state.filter ??= event.instances?.[0]?.guid ?? undefined;
      const display = await this.eventDisplay(event);
      attachements = display.attachment;
      components.push(container(display.components));
    } else {
      components.push(container(this.createTopCategoryRow(DisplayTabs.Events, this.state.user), ...this.eventslist()));
    }

    return { components, files: attachements ? [attachements] : undefined };
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
            custom_id: this.createCustomId({ filter: instance.guid }),
            label: this.planner.resolveToLuxon(instance.date).year.toString(),
            disabled: this.state.filter === instance.guid,
          }),
        )
      : [];

    instanceButtons.push(this.backbtn(this.createCustomId({ item: "", filter: "" })), this.homebtn());
    const rows =
      instanceButtons.length > 0
        ? Array.from({ length: Math.ceil(instanceButtons.length / 5) }, (_, i) => row(instanceButtons.slice(i * 5, i * 5 + 5)))
        : [];
    const instance = event.instances?.find((e) => e.guid === this.state.filter);

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
        .filter(Boolean)
        .flat() as APIComponentInContainer[],
    };
  }

  async getinstancedisplay(instance: SkyPlannerData.IEventInstance) {
    const [start, end] = [this.planner.resolveToLuxon(instance.date), this.planner.resolveToLuxon(instance.endDate)];
    const index = this.state.values?.[0] ? parseInt(this.state.values[0]) : 0;
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

    let attachment: RawFile | undefined;
    if (spirit?.tree) {
      const buffer = await generateSpiritTree(spirit.tree, {
        spiritName: spirit.name ?? spirit.spirit.name,
        spiritUrl: spirit.spirit.imageUrl,
      });
      attachment = { name: "tree.png", data: buffer };
    }
    return {
      attachment,
      components: [
        section(
          this.viewbtn(
            this.createCustomId({
              tab: DisplayTabs.Shops,
              item: instance.shops.map((s) => s.guid).join(","),
              back: { tab: DisplayTabs.Events, item: this.state.item, filter: this.state.filter },
            }),
            { label: "Shop", emoji: { id: emojis.shopcart } },
          ),
          `## ${instance.name ?? ""} Year ${start.year}`,
        ),
        instance.spirits.length > 1 ? selectRow : null,

        spirit
          ? section(
              this.viewbtn(this.createCustomId({}), { label: "Modify" }),
              `# ${spirit.name ?? spirit.spirit.name}`,
              this.planner.getFormattedTreeCost(spirit.tree),
              "-# Click the `Modify` button to mark/unmark items in this spirit tree as acquired",
            )
          : null,
        attachment ? mediaGallery(mediaGalleryItem("attachment://tree.png")) : null,
      ].filter(Boolean) as APIComponentInContainer[],
    };
  }
}
