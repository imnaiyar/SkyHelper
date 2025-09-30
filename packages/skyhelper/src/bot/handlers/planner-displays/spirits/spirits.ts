import { emojis, SkyPlannerData } from "@skyhelperbot/constants";
import { BasePlannerHandler, DisplayTabs } from "../base.js";
import { FilterType } from "../filter.manager.js";
import {
  button,
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
import { ComponentType, type APIComponentInContainer } from "discord-api-types/v10";
import type { ResponseData } from "@/utils/classes/InteractionUtil";
import type { RawFile } from "@discordjs/rest";
import { SpiritType } from "@skyhelperbot/constants/skygame-planner";

export class SpiritsDisplay extends BasePlannerHandler {
  constructor(data: SkyPlannerData.TransformedData, planner: typeof SkyPlannerData, state: any) {
    super(data, planner, state);
    this.state.d ??= "normal";
    this.initializeFilters([FilterType.SpiritTypes, FilterType.Order, FilterType.Realms, FilterType.Seasons], {
      [FilterType.SpiritTypes]: { defaultValues: [SpiritType.Regular] },
    });
  }
  override handle() {
    const spirits = this.data.spirits;
    const spirit = this.state.it ? spirits.find((s) => s.guid === this.state.it) : null;
    if (spirit) {
      console.log(spirit);
      return this.spiritdisplay(spirit);
    }

    // Get current filter values
    const spiritTypes = this.filterManager ? this.filterManager.getFilterValues(FilterType.SpiritTypes) : [SpiritType.Regular];
    const selected = (d: string) => this.state.d === d;
    const uppercomponent = (title: string) => [
      textDisplay(`# ${title}`, this.createFilterIndicator() ?? ""),
      row(
        this.viewbtn(this.createCustomId({ d: "normal", it: "", f: "", p: 1 }), {
          label: "Spirits",
          disabled: selected("normal"),
          style: selected("normal") ? 3 : 2,
        }),
        this.viewbtn(this.createCustomId({ d: "ts", it: "", f: "", p: 1 }), {
          label: "Traveling Spirits",
          disabled: selected("ts"),
          style: selected("ts") ? 3 : 2,
          emoji: { id: emojis.travelingspirit },
        }),
        this.viewbtn(this.createCustomId({ d: "rs", it: "", f: "", p: 1 }), {
          label: "Special Visits",
          disabled: selected("rs"),
          style: selected("rs") ? 3 : 2,
        }),
        this.createFilterButton("Filters"),
        this.homebtn(),
      ),
      separator(),
    ];

    const components: APIComponentInContainer[] = [];

    switch (this.state.d) {
      case "normal":
      default: {
        // Apply filters using FilterManager
        const spiritsOfType = this.filterManager
          ? this.filterManager.filterSpirits(spirits)
          : spirits.filter((s) => spiritTypes.includes(s.type));

        components.push(...uppercomponent(`Spirits (${spiritsOfType.length})`));
        components.push(
          ...this.displayPaginatedList({
            items: spiritsOfType,
            user: this.state.user,
            page: this.state.p ?? 1,
            perpage: 7,
            itemCallback: this.spiritInList.bind(this),
          }),
        );
        break;
      }
      case "ts":
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
      page: this.state.p ?? 1,
      perpage: 7,
      itemCallback: (t) => [
        section(
          button({
            label: "View",
            custom_id: this.createCustomId({
              it: t.guid,
              b: { t: this.state.t, p: this.state.p, it: "" },
            }),
            style: 1,
          }),
          `**${this.formatemoji(t.spirit.icon, t.spirit.name)} ${t.spirit.name} (#${t.number})**`,
          `From ${this.formatDateTimestamp(t.date)} to ${this.formatDateTimestamp(t.endDate ?? this.planner.resolveToLuxon(t.date).plus({ day: 3 }))}`,
          this.planner.getFormattedTreeCost(t.tree),
          "\u200b", // o-width for visual spacing, not using separator to save comp limit,
        ),
      ],
    });
  }

  spiritInList(spirit: SkyPlannerData.ISpirit) {
    return [
      section(
        button({
          custom_id: this.createCustomId({
            it: spirit.guid,
            b: { t: this.state.t, p: this.state.p, f: this.state.f, d: this.state.d },
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

  async spiritdisplay(spirit: SkyPlannerData.ISpirit): Promise<ResponseData> {
    const trees = [
      spirit.tree ? { name: "Spirit Tree", tree: spirit.tree, season: !!spirit.season } : null,
      spirit.treeRevisions?.length
        ? spirit.treeRevisions.map((t, i) => ({ name: t.name ?? `Spirit Tree (#${i + 2})`, tree: t }))
        : null,
      ...(spirit.ts?.map((t) => ({ name: `Traveling Spirit #${t.number}`, tree: t.tree })) ?? []),
    ]
      .flat()
      .filter(Boolean) as Array<{ name: string; tree: SkyPlannerData.ISpiritTree; season?: boolean }>;

    const selected = this.state.v?.[0] ? parseInt(this.state.v[0]) : 0;
    const tree = trees[selected];
    let attachment: RawFile | undefined;
    if (tree) {
      const buffer = await generateSpiritTree(tree.tree, { season: !!tree.season });
      attachment = { name: "tree.png", data: buffer };
    }

    const title = [
      `# ${this.formatemoji(spirit.icon)} ${spirit.name}`,
      spirit.area
        ? `${this.formatemoji(emojis.location)} ${spirit.area.name} ( ${this.formatemoji(spirit.area.realm.icon)} ${spirit.area.realm.name})`
        : null,
      spirit.season ? `${this.formatemoji(spirit.season.icon)} ${spirit.season.name}` : null,
      spirit.events?.length ? `${this.formatemoji(emojis.eventticket)} ${spirit.events.at(-1)!.eventInstance?.event.name}` : null,
      `Type: ${spirit.type}`,
    ].filter(Boolean) as [string, ...string[]];

    const compos = [
      spirit.imageUrl ? section(thumbnail(spirit.imageUrl), ...title) : textDisplay(...title),
      row(this.backbtn(this.createCustomId({ t: DisplayTabs.Spirits, f: "", it: "", ...this.state.b })), this.homebtn()),
      separator(true, 1),
      trees.length > 1
        ? row({
            type: ComponentType.StringSelect,
            custom_id: this.createCustomId({}),
            options: trees.map((t, i) => ({ label: t.name, value: i.toString(), default: selected === i })),
            placeholder: "Select a spirit tree",
          })
        : null,
      tree
        ? section(
            this.viewbtn(this.createCustomId({}), { label: "Modify" }),
            this.planner.getFormattedTreeCost(tree.tree),
            "-# Click the `Modify` button to mark/unmark items in this spirit tree as acquired",
          )
        : null,
      tree ? mediaGallery(mediaGalleryItem("attachment://tree.png")) : null,
    ].filter(Boolean) as APIComponentInContainer[];

    return {
      components: [container(compos)],
      files: attachment ? [attachment] : undefined,
    };
  }
}
