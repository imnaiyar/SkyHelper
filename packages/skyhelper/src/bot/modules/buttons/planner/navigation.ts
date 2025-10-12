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
  async execute(interaction, _t, helper, { t, p, it, f, d, back, i }) {
    const getLoading = setLoadingState(interaction.message.components!, interaction.data.custom_id);
    await helper.update({ components: getLoading });
    const b = back ? (Utils.parseCustomId(back) as unknown as Omit<NavigationState, "back" | "values">) : undefined;
    const response = await handlePlannerNavigation(
      {
        t: t as any,
        it: it ?? undefined,
        p: p ?? undefined,
        d: d ?? undefined,
        f: f ?? undefined,
        i: i ?? undefined,
        b,
      },
      helper.user,
      helper.client,
    );

    await helper.editReply({
      ...response,
      flags: MessageFlags.IsComponentsV2,
    });
  },
});
