import type { NavigationState } from "@/handlers/planner-displays/base";
import { defineButton } from "@/structures";
import Utils from "@/utils/classes/Utils";
import { CustomId } from "@/utils/customId-store";
import { type APILabelComponent, ComponentType, type APITextDisplayComponent } from "@discordjs/core";
import { row, textDisplay } from "@skyhelperbot/utils";
import { SkyPlannerData } from "@skyhelperbot/constants";
import { handlePlannerNavigation } from "@/handlers/planner";

export enum FilterKeys {
  Order = "order",
  SpiritTypes = "spiritTypes",
  Realms = "realms",
  Seasons = "seasona",
  Events = "events",
}
/* ["order", "spiritTypes", "realms", "seasons", "events"]; */
const FilterMap = {};
export default defineButton({
  data: { name: "filter" },
  id: CustomId.PlannerFilters,
  async execute(_interaction, _t, helper, props) {
    const { tab, filters, user, def } = props;
    const unwrapped = Utils.parseCustomId(tab) as unknown as NavigationState;
    const data = await SkyPlannerData.getSkyGamePlannerData();
    const mapped_filters: Record<(typeof FilterKeys)[number], Array<{ label: string; value: string }>> = {
      realms: data.realms.map((r) => ({ label: r.name, value: r.guid })),
      seasons: data.seasons.map((s) => ({ label: s.name, value: s.guid })),
      events: data.events.map((e) => ({ label: e.name, value: e.guid })),
    };
    const formatted = filters.map((f) => {
      const [key, defaults] = f.split(":");
      const options = FilterKeys.find((k) => k === key);
      if (!options) throw new Error(`Unknown filter key ${key}`);
      return { key, defaults: defaults ? defaults.split(",") : [] };
    });
    const components: Array<APILabelComponent | APITextDisplayComponent> = formatted.map((f) => ({
      type: ComponentType.Label,
      label: Utils.capitalize(f.key!),
      description: `Filter by ${Utils.capitalize(f.key!)}`,
      component: {
        type: ComponentType.StringSelect,
        custom_id: f.key!,
        options: mapped_filters[f.key!]!.map((o) => ({
          ...o,
          default: f.defaults.includes(o.value),
        })),
      },
    }));

    const display_text = textDisplay(
      `Please select all the filters you'd like to apply to this. You can select multiple options in each filter. If you leave out a filter, all options may be selected by default`,
    );
    components.unshift(display_text);
    // currently modal only supports 5 components, and each filter will occupy one + 1 for informative textdisplay
    if (formatted.length > 4) throw new Error(`Expected filters to be less than 4, recieved ${filters.length}`);
    await helper.launchModal({ title: `${unwrapped.tab} Filters`, custom_id: "placeholder", components });

    const recieved_filters: string[] = [];
    const ff = `${def ?? ""}${recieved_filters.join("/")}`;
    // handle the submission here followed by this redirect, need to transform filters first
    await handlePlannerNavigation({ ...unwrapped, user: user ?? helper.user.id, filter: ff || undefined });
  },
});
