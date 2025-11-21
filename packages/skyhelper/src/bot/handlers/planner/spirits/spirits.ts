import { emojis } from "@skyhelperbot/constants";
import { DisplayTabs, FilterType, SpiritType } from "@/types/planner";
import { button, container, row, section, separator, textDisplay, thumbnail } from "@skyhelperbot/utils";
import { ComponentType, type APIComponentInContainer } from "discord-api-types/v10";
import type { ResponseData } from "@/utils/classes/InteractionUtil";
import { BaseSpiritsDisplay } from "./base.js";
import { spiritTreeDisplay } from "../shared.js";
import { DateTime } from "luxon";
import { SpiritTreeHelper, type ISpirit } from "skygame-data";
import { CostUtils } from "../helpers/cost.utils.js";

export class SpiritsDisplay extends BaseSpiritsDisplay {
  constructor(data: any, state: any, settings: any, client: any) {
    super(data, state, settings, client);
    this.state.d ??= "normal";
    this.initializeFilters(
      [FilterType.SpiritTypes, FilterType.Order, FilterType.Realms, FilterType.Seasons, FilterType.Areas, FilterType.Highlight],
      {
        [FilterType.SpiritTypes]: { defaultValues: [SpiritType.Regular] },
      },
    );
  }
  override handle() {
    const spirits = this.data.spirits.items;
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
        // back increases component count so lower limit for that
        perpage: this.state.b?.t ? 6 : 7,
        itemCallback: this.spiritInList.bind(this),
      }),
    ];

    return { components: [container(components)] };
  }

  spiritInList(spirit: ISpirit) {
    return [
      section(
        button({
          custom_id: this.createCustomId({
            it: spirit.guid,
            /* Not passing filter because resulting custom id gets too long, ig it's a compromise */
            b: { t: this.state.t, p: 1, f: "", d: this.state.d },
          }),
          style: 1,
          label: "View",
        }),
        `## ${this.formatemoji(spirit.emoji, spirit.name)} ${spirit.name}`,
        [
          spirit.type,
          spirit.area
            ? this.formatemoji(spirit.area.realm.emoji, spirit.area.realm.shortName) + ` ${spirit.area.realm.shortName}`
            : null,
          spirit.season ? this.formatemoji(spirit.season.emoji, spirit.season.name) + ` ${spirit.season.shortName}` : null,
        ]
          .filter(Boolean)
          .join(" \u2022 "),
        spirit.tree ? (CostUtils.treeToCostEmoji(spirit.tree) ?? "") : "",
        "\u200b", // o-width for visual spacing, not using separator to save comp limit,,
      ),
    ];
  }

  async spiritdisplay(spirit: ISpirit): Promise<ResponseData> {
    const trees = [
      spirit.tree
        ? {
            name: "Spirit Tree",
            tree: spirit.tree,
            season: !!spirit.season,
            date: spirit.season ? spirit.season.date : undefined,
          }
        : null,
      spirit.treeRevisions?.length
        ? spirit.treeRevisions.map((t, i) => ({ name: t.name ?? `Spirit Tree (#${i + 2})`, tree: t, date: undefined }))
        : null,
      spirit.eventInstanceSpirits?.length
        ? spirit.eventInstanceSpirits.map((s) => {
            const instance = s.eventInstance;
            const date = instance?.date ?? undefined;
            return {
              name: (instance?.name ?? instance?.event.name ?? "Event Spirit") + " " + (date ? `(${date.year.toString()})` : ""),
              tree: s.tree,
              date,
            };
          })
        : null,
      ...(spirit.specialVisitSpirits?.map((r) => ({
        name: r.visit.name ?? "Special Visit",
        tree: r.tree,
        sv: r.guid,
        date: r.visit.date,
      })) ?? []),
      ...(spirit.travelingSpirits?.map((t) => ({
        name: `Traveling Spirit #${t.number}`,
        tree: t.tree,
        ts: t.guid,
        date: t.date,
      })) ?? []),
    ]
      .flat()
      .filter((s) => !!s)
      .sort((a, b) => (b.date ?? DateTime.now()).toMillis() - (a.date ?? DateTime.now()).toMillis());

    const highlights = this.filterManager?.getFilterValues(FilterType.Highlight) ?? [];
    let selected = 0;

    // if highlighted items, then default select the tree that has the item
    const index = trees.findIndex((t) => {
      const nodes = SpiritTreeHelper.getNodes(t.tree);
      return nodes.some((n) => highlights.includes(n.item?.guid ?? ""));
    });
    if (index > -1) selected = index;

    // some places may pass this value in `i`, like from, passing the default selected tree id ts display
    if (this.state.i?.startsWith("tree")) {
      const treeGuid = this.state.i.slice(4);
      const treeIndex = trees.findIndex((tt) => tt.tree.guid === treeGuid);

      selected = Math.max(treeIndex, 0);
    } else if (this.state.v?.[0]) {
      selected = parseInt(this.state.v[0]);
    }
    const tree = trees[selected];
    const gen = tree
      ? await spiritTreeDisplay(
          { tree: tree.tree, planner: this, spiritView: false },
          { season: "season" in tree && tree.season, highlightItems: highlights, spiritSubtitle: tree.name },
        )
      : null;

    const title = [
      `# ${this.formatemoji(spirit.emoji)} ${spirit.name}`,
      spirit.area
        ? `${this.formatemoji(emojis.location)} ${spirit.area.name} ( ${this.formatemoji(spirit.area.realm.emoji)} ${spirit.area.realm.name})`
        : null,
      spirit.season ? `${this.formatemoji(spirit.season.emoji)} ${spirit.season.name}` : null,
      spirit.eventInstanceSpirits?.length
        ? `${this.formatemoji(emojis.eventticket)} ${spirit.eventInstanceSpirits.at(-1)!.eventInstance?.event.name}`
        : null,
      `Type: ${spirit.type}`,
    ].filter(Boolean) as [string, ...string[]];
    const compos = [
      spirit.imageUrl ? section(thumbnail(spirit.imageUrl), ...title) : textDisplay(...title),
      row(
        this.backbtn(this.createCustomId({ t: DisplayTabs.Spirits, f: null, it: null, ...this.state.b, b: null })),
        this.homebtn(),
      ),
      separator(true, 1),

      tree && "ts" in tree ? textDisplay(this.tsdescription(tree.ts)) : null,
      tree && "sv" in tree ? textDisplay(this.svsdescription(tree.sv)) : null,
      trees.length > 1
        ? row({
            type: ComponentType.StringSelect,
            custom_id: this.createCustomId({ i: null /* reset i, so we don't keep the previous selection */ }),
            options: trees.map((t, i) => ({ label: t.name, value: i.toString(), default: selected === i })),
            placeholder: "Select a spirit tree",
          })
        : null,
      gen ? gen.components : null,
    ]
      .filter((s) => !!s)
      .flat();

    return {
      components: [container(compos)],
      files: gen?.file ? [gen.file] : undefined,
    };
  }

  private tsdescription(guid: string) {
    const ts = this.data.travelingSpirits.items.find((d) => d.guid === guid);
    if (!ts) throw new Error("Invalid TS");
    return `**Traveling Spirit #${ts.number}: ${this.formatDateTimestamp(ts.date)} - ${this.formatDateTimestamp(ts.endDate)} (${this.formatDateTimestamp(ts.endDate, "R")})**`;
  }
  private svsdescription(guid: string) {
    const sv = this.data.specialVisitSpirits.items.find((d) => d.guid === guid);
    if (!sv) throw new Error("Invalid SV Spirit: " + guid);
    return `**${sv.visit.name}: ${this.formatDateTimestamp(sv.visit.date)} - ${this.formatDateTimestamp(sv.visit.endDate)} (${this.formatDateTimestamp(sv.visit.endDate, "R")})**`;
  }
}

