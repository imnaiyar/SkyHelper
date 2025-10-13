import { CustomId } from "@/utils/customId-store";
import { defineButton } from "@/structures";
import { MessageFlags } from "discord-api-types/v10";
import {
  toggleIAPStatus,
  toggleWingedLightUnlock,
  toggleItemFavorite,
  toggleSeasonPass,
  unlockAllTreeNodes,
  lockAllTreeNodes,
} from "@/handlers/planner-utils";
import { handlePlannerNavigation } from "@/handlers/planner";
import { SkyPlannerData } from "@skyhelperbot/constants";
import { setLoadingState } from "@/utils/loading";
import { getAllTreeNodes } from "@skyhelperbot/constants/skygame-planner";
import { PlannerAction, type NavigationState } from "@/types/planner";

/**
 * Button handler for Sky Game Planner user actions (unlock/lock items, nodes, etc.)
 */
export default defineButton({
  id: CustomId.PlannerActions,
  data: { name: "planner-actions" },
  async execute(interaction, _t, helper, { action, guid, gifted, navState, actionType }) {
    const getLoading = setLoadingState(interaction.message.components!, interaction.data.custom_id);
    await helper.update({ components: getLoading });

    const user = await helper.client.schemas.getUser(helper.user);
    const data = await SkyPlannerData.getSkyGamePlannerData();

    let resultMessage = "";

    switch (action as PlannerAction) {
      case PlannerAction.ToggleIAP: {
        const iap = data.iaps.find((i) => i.guid === guid);
        if (iap) {
          const isGifted = gifted === "true";
          const status = toggleIAPStatus(user, iap, isGifted);
          if (status === "bought") {
            resultMessage = `✅ Marked ${iap.name ?? "IAP"} as bought`;
          } else if (status === "gifted") {
            resultMessage = `🎁 Marked ${iap.name ?? "IAP"} as gifted`;
          } else {
            resultMessage = `🔒 Removed ${iap.name ?? "IAP"}`;
          }
        }
        break;
      }

      case PlannerAction.ToggleWL: {
        let unlocked;
        if (actionType === "all") {
          unlocked = data.wingedLights.map((w) => toggleWingedLightUnlock(user, w))[0];
        }
        const wl = data.wingedLights.find((w) => w.guid === guid);
        if (wl) {
          unlocked = toggleWingedLightUnlock(user, wl);
          resultMessage = unlocked ? `✅ Collected Winged Light` : `🔒 Removed Winged Light`;
        }
        break;
      }

      case PlannerAction.ToggleFavorite: {
        const item = data.items.find((i) => i.guid === guid);
        if (item) {
          const favorited = toggleItemFavorite(user, item);
          resultMessage = favorited ? `⭐ Favorited ${item.name}` : `Unfavorited ${item.name}`;
        }
        break;
      }

      case PlannerAction.ToggleSeasonPass: {
        const isGifted = gifted === "true";
        const status = toggleSeasonPass(user, guid, isGifted);
        if (status === "owned") {
          resultMessage = `✅ Season Pass marked as bought`;
        } else if (status === "gifted") {
          resultMessage = `🎁 Season Pass marked as gifted`;
        } else {
          resultMessage = `🔒 Season Pass removed`;
        }
        break;
      }

      case PlannerAction.UnlockTree: {
        const tree = data.spiritTrees.find((t) => t.guid === guid);
        if (tree) {
          const allNodes = getAllTreeNodes(tree.node);
          unlockAllTreeNodes(user, allNodes);
          resultMessage = `✅ Unlocked entire tree`;
        }
        break;
      }

      case PlannerAction.LockTree: {
        const tree = data.spiritTrees.find((t) => t.guid === guid);
        if (tree) {
          const allNodes = getAllTreeNodes(tree.node);
          lockAllTreeNodes(user, allNodes);
          resultMessage = `🔒 Locked entire tree`;
        }
        break;
      }
    }

    await user.save();

    const parsedState = JSON.parse(navState) as Omit<NavigationState, "user">;
    const response = await handlePlannerNavigation(parsedState, helper.user, helper.client);

    await helper.editReply({
      ...response,
      flags: MessageFlags.IsComponentsV2,
    });

    await helper.followUp({
      content: resultMessage || "Action Completed",
      flags: MessageFlags.Ephemeral,
    });
  },
});
