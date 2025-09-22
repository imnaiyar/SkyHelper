import type { NavigationState } from "@/handlers/planner-displays/base";
import { defineButton } from "@/structures";
import Utils from "@/utils/classes/Utils";
import { CustomId } from "@/utils/customId-store";

const FilterKeys = ["realms", "seasons", "events"];

export default defineButton({
  data: { name: "filter" },
  id: CustomId.PlannerFilters,
  async execute(_interaction, _t, helper, props) {
    const { tab, filters, user } = props;
    const unwrapped = Utils.parseCustomId(tab) as unknown as NavigationState;
    const formatted = filters.map((f) => {
      const [key, defaults] = f.split(":");
      const options = FilterKeys.find((k) => k === key);
      if (!options) throw new Error(`Unknown filter key ${key}`);
      return { key, defaults: defaults ? defaults.split(",") : [] };
    });

    // currently modal only supports 5 components, and each filter will occupy one + 1 for informative textdisplay
    if (formatted.length > 4) throw new Error(`Expected filters to be less than 4, recieved ${filters.length}`);
  },
});
