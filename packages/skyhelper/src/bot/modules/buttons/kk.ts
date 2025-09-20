import { CustomId } from "@/utils/customId-store";
import { handlePlannerNavigation } from "../../handlers/planner.js";
import { defineButton } from "@/structures";
import { textDisplay } from "@skyhelperbot/utils";
import { MessageFlags } from "discord-api-types/v10";
import type { NavigationState } from "@/handlers/p/base";
import { setLoadingState } from "@/utils/loading";

/**
 * Button handler for the Sky Game Planner navigation
 * This handler is responsible for all navigation within the planner
 */
export default defineButton({
  id: CustomId.PlannerTopLevelNav,
  data: { name: "planner-navigation" },
  // Handle the button interaction
  async execute(interaction, t, helper, data) {
    // Extract navigation state from the button data
    const {
      tab,
      item,
      page,
      filter,
      data: d,
      back,
    } = helper.client.utils.parseCustomId(data.tab) as unknown as NavigationState & {
      id: string;
    };
    const getLoading = setLoadingState(interaction.message.components!, interaction.data.custom_id);
    await helper.update({ components: getLoading });
    const p = page ? parseInt(page as unknown as string) : undefined;
    const b = back ? (JSON.parse(back as unknown as string) as unknown as Omit<NavigationState, "back" | "values">) : undefined;
    const response = await handlePlannerNavigation({
      tab: tab as any,
      item,
      page: p ?? undefined,
      data: d ?? undefined,
      filter,
      back: b,
    });

    await helper.editReply({
      ...response,
      flags: MessageFlags.IsComponentsV2,
    });
  },
});
