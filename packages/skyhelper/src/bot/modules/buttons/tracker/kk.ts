import { CustomId } from "@/utils/customId-store";
import { handlePlannerNavigation } from "../../../handlers/planner.js";
import { defineButton } from "@/structures";
import { MessageFlags } from "discord-api-types/v10";
import type { NavigationState } from "@/handlers/planner-displays/base";
import { setLoadingState } from "@/utils/loading";
import Utils from "@/utils/classes/Utils";

/**
 * Button handler for the Sky Game Planner navigation
 * This handler is responsible for all navigation within the planner
 */
export default defineButton({
  id: CustomId.PlannerTopLevelNav,
  data: { name: "planner-navigation" },
  // Handle the button interaction
  async execute(interaction, _t, helper, data) {
    // Extract navigation state from the button data
    const { t, it, p, f, d } = Utils.parseCustomId(data.tab) as unknown as NavigationState;
    const getLoading = setLoadingState(interaction.message.components!, interaction.data.custom_id);
    await helper.update({ components: getLoading });
    const page = p ? parseInt(p as unknown as string) : undefined;
    const b = data.back ? (Utils.parseCustomId(data.back) as unknown as Omit<NavigationState, "back" | "values">) : undefined;
    const response = await handlePlannerNavigation({
      t: t as any,
      it,
      p: page ?? undefined,
      d,
      f,
      b,
    });

    await helper.editReply({
      ...response,
      flags: MessageFlags.IsComponentsV2,
    });
  },
});
