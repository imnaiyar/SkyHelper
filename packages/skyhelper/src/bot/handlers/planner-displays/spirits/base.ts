import { emojis } from "@skyhelperbot/constants";
import { BasePlannerHandler } from "../base.js";
import { section, textDisplay, row, separator } from "@skyhelperbot/utils";
import { SpiritType } from "@skyhelperbot/constants/skygame-planner";

export class BaseSpiritsDisplay extends BasePlannerHandler {
  filters: { spiritTypes: SpiritType[]; realms?: string[]; seasons?: string[] } = {
    spiritTypes: [SpiritType.Regular],
  };
  protected topComponents(title: string) {
    const selected = (d: string) => this.state.d === d;
    return [
      this.state.b?.t
        ? section(
            this.backbtn(this.createCustomId({ ...this.state.b, b: undefined })),
            `# ${title}`,
            this.createFilterIndicator() ?? "",
          )
        : textDisplay(`# ${title}`, this.createFilterIndicator() ?? ""),
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
  }
}
