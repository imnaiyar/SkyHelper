import { CustomId } from "@/utils/customId-store";
import { handlePlannerNavigation, type NavigationState } from "../../handlers/planner.js";
import { defineButton } from "@/structures";
import { textDisplay } from "@skyhelperbot/utils";
import { MessageFlags } from "discord-api-types/v10";

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
    const { tab, item, page, user } = helper.client.utils.parseCustomId(data.tab) as unknown as NavigationState & { id: string };

    // Show thinking indicator while we process
    await helper.deferUpdate();

    // Handle the navigation and get the response
    const response = await handlePlannerNavigation({
      tab: tab as any,
      item,
      page: page ?? undefined,
    });

    // Edit the original message with the new content
    await helper.editReply({
      components: response.components,
      flags: MessageFlags.IsComponentsV2,
    });
  },
});
