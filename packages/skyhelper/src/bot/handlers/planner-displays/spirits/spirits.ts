import { emojis, SkyPlannerData as p, SkyPlannerData, season_emojis } from "@skyhelperbot/constants";
import { BasePlannerHandler, DisplayTabs } from "../base.js";
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

const SpiritNav = [SpiritType.Regular, SpiritType.Season, SpiritType.Elder, SpiritType.Guide, "TS"] as const;
const emojisMap = {
  [p.SpiritType.Regular]: emojis.regularspirit,
  [p.SpiritType.Season]: season_emojis.Gratitude,
  [p.SpiritType.Elder]: emojis.realmelders,
  [p.SpiritType.Guide]: emojis.auroraguide,
  ["TS"]: emojis.travelingspirit,
} as const;
// TODO: handle various filters, like realm, season, type

export class SpiritsDisplay extends BasePlannerHandler {
  filters: { spiritTypes: SpiritType[]; realms?: string[]; seasons?: string[] } = {
    spiritTypes: [SpiritType.Regular],
  };
  override handle() {
    const spirits = this.data.spirits;
    const spirit = this.state.item ? spirits.find((s) => s.guid === this.state.item) : null;
    if (spirit) {
      return this.spiritdisplay(spirit);
    }
    this.parseFilters();
    const filternav = SpiritNav.map((s) =>
      button({
        label: s,
        custom_id: this.createCustomId({
          filter: this.transformFilters(s),
          data: s === "TS" ? "TS" : "normal",
          page: 1,
          item: "",
        }),
        emoji: { id: emojisMap[s] },

        style: s === "TS" && this.state.data === "TS" ? 3 : this.filters.spiritTypes.includes(s as SpiritType) ? 3 : 2,
        disabled: s === "TS" && this.state.data === "TS",
      }),
    );
    const uppercomponent = (title: string) => [
      row(filternav),
      section(
        button({
          label: "Home",
          custom_id: this.createCustomId({ tab: DisplayTabs.Home }),
          style: 4,
          emoji: { id: emojis.leftarrow },
        }),
        `# ${title}`,
      ),
      separator(),
    ];

    const components: APIComponentInContainer[] = [];

    switch (this.state.data) {
      case "normal":
      default: {
        const spiritsOfType = spirits.filter((s) => this.filters.spiritTypes.includes(s.type));
        components.push(
          ...uppercomponent(`Spirits (${spiritsOfType.length})` + `\n-# Filters: ${this.filters.spiritTypes.join(",")}`),
        );
        components.push(
          ...this.displayPaginatedList({
            items: spiritsOfType,
            user: this.state.user,
            page: this.state.page ?? 1,
            perpage: 7,
            itemCallback: this.spiritInList.bind(this),
          }),
        );
        break;
      }
      case "TS":
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
      page: this.state.page ?? 1,
      perpage: 7,
      itemCallback: (t) => [
        section(
          button({
            label: "View",
            custom_id: this.createCustomId({
              item: t.guid,
              back: { tab: this.state.tab, page: this.state.page, filter: this.state.filter, item: "" },
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
            item: spirit.guid,
            back: { tab: this.state.tab, page: this.state.page, filter: this.state.filter, item: "" },
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
    const selected = this.state.values?.[0] ? parseInt(this.state.values[0]) : 0;
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
      row(
        this.backbtn(this.createCustomId({ tab: DisplayTabs.Spirits, filter: "", item: "", ...this.state.back })),
        this.homebtn(),
      ),
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

  private parseFilters() {
    if (!this.state.filter) return;
    const parts = this.state.filter.split("/");
    if (parts.length === 0) return;
    for (const part of parts) {
      const [k, v] = part.split(":") as [keyof SpiritsDisplay["filters"], string | undefined];
      if (!v) continue;
      this.filters[k] = v.split(",") as any;
    }
    if (this.state.data === "TS") {
      this.filters.spiritTypes = []; // basically unselect all others for TS is treated as a standalone display;
      this.state.filter = "";
    }
  }

  private transformFilters(type?: string) {
    const filters = structuredClone(this.filters); // deep clone to avoid modifi=ying original
    if (type && !filters.spiritTypes.includes(type as any)) filters.spiritTypes.push(type as any);
    else if (type) filters.spiritTypes = filters.spiritTypes.filter((t) => t !== (type as any));
    const s = Object.entries(filters).reduce((acc, [k, v]) => {
      if (v.length > 0) return `${acc}${acc.length > 0 ? "/" : ""}${k}:${v.join(",")}`;
      return acc;
    }, "");
    console.log(this.filters);
    return s;
  }
}
