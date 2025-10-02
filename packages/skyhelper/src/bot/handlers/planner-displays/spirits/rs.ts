import { BaseSpiritsDisplay } from "./base.js";
import { FilterType, OrderType } from "../filter.manager.js";
import { type IReturningSpirits } from "@skyhelperbot/constants/skygame-planner";
import {
  section,
  container,
  thumbnail,
  textDisplay,
  row,
  separator,
  generateSpiritTree,
  mediaGallery,
  mediaGalleryItem,
} from "@skyhelperbot/utils";
import { ComponentType } from "@discordjs/core";
import type { RawFile } from "@discordjs/rest";
export class ReturningSpiritDisplay extends BaseSpiritsDisplay {
  constructor(data: any, planner: any, state: any) {
    super(data, planner, state);
    this.initializeFilters([FilterType.Order], { [FilterType.Order]: { defaultValues: [OrderType.DateDesc] } });
  }
  override async handle() {
    if (this.state.it) {
      const visit = this.data.returningSpirits.find((rs: IReturningSpirits) => rs.guid === this.state.it);
      if (visit) {
        const { components, files } = await this.rsdisplay(visit);
        return { components: [container(components)], files };
      } else {
        throw new Error("Returning Spirit not found");
      }
    }
    const filtered = this.filterManager!.filterSpirits(this.data.returningSpirits);
    return { components: [container(this.topComponents(`Special Visits (${filtered.length})`), ...this.rslist(filtered))] };
  }

  private rslist(rss: IReturningSpirits[]) {
    return this.displayPaginatedList({
      items: rss,
      perpage: 7,
      user: this.state.user,
      page: this.state.p ?? 1,
      itemCallback: (rs) => [
        section(
          this.viewbtn(this.createCustomId({ it: rs.guid, d: "rs", b: { ...this.state, b: null, v: undefined } })),
          [
            `# ${rs.name ?? "Special Visit"}`,
            `-# ${rs.spirits.map((s) => `**${this.formatemoji(s.spirit.emoji, s.spirit.name)} ${s.spirit.name}**`).join(" | ")}`,
            `From ${this.formatDateTimestamp(rs.date)} to ${this.formatDateTimestamp(rs.endDate)} (${this.formatDateTimestamp(rs.endDate, "R")})`,
            this.planner.formatGroupedCurrencies(rs.spirits.map((s) => s.tree)),
          ].join("\n"),
        ),
      ],
    });
  }

  private async rsdisplay(rs: IReturningSpirits) {
    const title = [
      `# ${rs.name ?? "Special Visit"}`,
      `-# ${rs.spirits.map((s) => `**${this.formatemoji(s.spirit.emoji, s.spirit.name)} ${s.spirit.name}**`).join(" | ")}`,
      `From ${this.formatDateTimestamp(rs.date)} to ${this.formatDateTimestamp(rs.endDate)} (${this.formatDateTimestamp(rs.endDate, "R")})`,
      this.planner.formatGroupedCurrencies(rs.spirits.map((s) => s.tree)),
    ].join("\n");

    const selected = parseInt(this.state.v?.[0] ?? "0");
    const spirit = rs.spirits[selected]!;

    const buffer = await generateSpiritTree(spirit.tree);
    const file: RawFile = { name: "tree.png", data: buffer };
    return {
      components: [
        rs.imageUrl ? section(thumbnail(rs.imageUrl), title) : textDisplay(title),
        row(
          [this.state.b ? this.backbtn(this.createCustomId({ ...this.state.b, it: "", b: null })) : null, this.homebtn()].filter(
            (c) => !!c,
          ),
        ),
        separator(true, 1),
        textDisplay("## Spirits"),
        row({
          type: ComponentType.StringSelect,
          custom_id: this.createCustomId({}),
          options: rs.spirits.map((s, i) => ({
            label: s.spirit.name,
            value: i.toString(),
            default: i === selected,
            emoji: s.spirit.emoji ? { id: s.spirit.emoji } : undefined,
          })),
        }),
        section(
          this.viewbtn(this.createCustomId({}), { label: "Modify" }),
          `## ${this.formatemoji(spirit.spirit.emoji, spirit.spirit.name)} ${spirit.spirit.name}`,
          this.planner.getFormattedTreeCost(spirit.tree),
          "-# Click the `Modify` button to mark/unmark items in this spirit tree as acquired",
        ),
        mediaGallery(mediaGalleryItem("attachment://tree.png")),
      ],
      files: [file],
    };
  }
}
