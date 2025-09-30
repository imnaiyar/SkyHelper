import { emojis, SkyPlannerData } from "@skyhelperbot/constants";
import { DisplayTabs } from "../base.js";
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
import { BaseSpiritsDisplay } from "./base.js";

export class SpiritsDisplay extends BaseSpiritsDisplay {
  constructor(data: SkyPlannerData.TransformedData, planner: typeof SkyPlannerData, state: any) {
    super(data, planner, state);
    this.state.d ??= "normal";
    this.initializeFilters([FilterType.SpiritTypes, FilterType.Order, FilterType.Realms, FilterType.Seasons, FilterType.Areas], {
      [FilterType.SpiritTypes]: { defaultValues: [SpiritType.Regular] },
    });
  }
  override handle() {
    const spirits = this.data.spirits;
    const spirit = this.state.it ? spirits.find((s) => s.guid === this.state.it) : null;
    if (spirit) {
      return this.spiritdisplay(spirit);
    }

    // Get current filter values
    const spiritTypes = this.filterManager ? this.filterManager.getFilterValues(FilterType.SpiritTypes) : [SpiritType.Regular];

    // Apply filters using FilterManager
    const spiritsOfType = this.filterManager
      ? this.filterManager.filterSpirits(spirits)
      : spirits.filter((s) => spiritTypes.includes(s.type));

    const components: APIComponentInContainer[] = [
      ...this.topComponents(`Spirits (${spiritsOfType.length})`),
      ...this.displayPaginatedList({
        items: spiritsOfType,
        user: this.state.user,
        page: this.state.p ?? 1,
        perpage: 7,
        itemCallback: this.spiritInList.bind(this),
      }),
    ];

    return { components: [container(components)] };
  }

  spiritInList(spirit: SkyPlannerData.ISpirit) {
    return [
      section(
        button({
          custom_id: this.createCustomId({
            it: spirit.guid,
            /* Not passing filter because resulting custom id gets too long, ig it's a compromise */
            b: { t: this.state.t, p: 1, f: "", d: this.state.d, b: null },
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
    // TODO: refactor this so we can add more details about ts visit that way (or rs too)...
    const trees = [
      spirit.tree ? { name: "Spirit Tree", tree: spirit.tree, season: !!spirit.season } : null,
      spirit.treeRevisions?.length
        ? spirit.treeRevisions.map((t, i) => ({ name: t.name ?? `Spirit Tree (#${i + 2})`, tree: t }))
        : null,
      ...(spirit.returns?.map((r) => ({ name: r.return.name ?? "Special Visit", tree: r.tree })) ?? []),
      ...(spirit.ts?.map((t) => ({ name: `Traveling Spirit #${t.number}`, tree: t.tree })) ?? []),
    ]
      .flat()
      .filter(Boolean) as Array<{ name: string; tree: SkyPlannerData.ISpiritTree; season?: boolean }>;

    let selected = 0;
    // some places may  pass this value in `i`, like from ts display
    if (this.state.i?.startsWith("tree")) {
      const treeIndex = parseInt(this.state.i.substring(4)) || 0;
      selected = Math.min(treeIndex, trees.length - 1);
    } else if (this.state.v?.[0]) {
      selected = parseInt(this.state.v[0]);
    }

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
      row(this.backbtn(this.createCustomId({ t: DisplayTabs.Spirits, f: "", it: "", ...this.state.b, b: null })), this.homebtn()),
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
