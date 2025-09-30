import { emojis, SkyPlannerData as p, season_emojis } from "@skyhelperbot/constants";
import { BasePlannerHandler } from "../base.js";
import { button } from "@skyhelperbot/utils";
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

export class BaseSpiritsDisplay extends BasePlannerHandler {
  filters: { spiritTypes: SpiritType[]; realms?: string[]; seasons?: string[] } = {
    spiritTypes: [SpiritType.Regular],
  };
  override handle() {
    this.parseFilters();
    const filternav = SpiritNav.map((s) =>
      button({
        label: s,
        custom_id: this.createCustomId({
          f: this.transformFilters(s),
          d: s === "TS" ? "TS" : "normal",
          p: 1,
          it: "",
        }),
        emoji: { id: emojisMap[s] },

        style: s === "TS" && this.state.d === "TS" ? 3 : this.filters.spiritTypes.includes(s as SpiritType) ? 3 : 2,
        disabled: s === "TS" && this.state.d === "TS",
      }),
    );
    return { components: [] };
  }

  topRows() {
    const filternav = SpiritNav.map((s) =>
      button({
        label: s,
        custom_id: this.createCustomId({
          f: this.transformFilters(s),
          d: s === "TS" ? "TS" : "normal",
          p: 1,
          it: "",
        }),
        emoji: { id: emojisMap[s] },

        style: s === "TS" && this.state.d === "TS" ? 3 : this.filters.spiritTypes.includes(s as SpiritType) ? 3 : 2,
        disabled: s === "TS" && this.state.d === "TS",
      }),
    );
  }

  public parseFilters() {
    if (!this.state.f) return;
    const parts = this.state.f.split("/");
    if (parts.length === 0) return;
    for (const part of parts) {
      const [k, v] = part.split(":") as [keyof BaseSpiritsDisplay["filters"], string | undefined];
      if (!v) continue;
      this.filters[k] = v.split(",") as any;
    }
    if (this.state.d === "TS") {
      this.filters.spiritTypes = []; // basically unselect all others for TS is treated as a standalone display;
      this.state.f = "";
    }
  }

  public transformFilters(type?: string) {
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
