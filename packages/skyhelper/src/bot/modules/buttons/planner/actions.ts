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
  deserializeNavState,
  modifyNestingRotationItems,
  adjustCurrencies,
} from "@/handlers/planner-utils";
import { handlePlannerNavigation } from "@/handlers/planner";
import { SkyPlannerData } from "@skyhelperbot/constants";
import { setLoadingState } from "@/utils/loading";
import {
  enrichDataWithUserProgress,
  getAllNodes,
  nestingconfigs,
  PlannerDataHelper,
} from "@skyhelperbot/constants/skygame-planner";
import { PlannerAction, type NavigationState } from "@/types/planner";
import { modifyTreeNode } from "./sub/modify.tree.js";
import { WingedLightsDisplay } from "@/handlers/planner-displays/wingedlights";

/**
 * Button handler for Sky Game Planner user actions (unlock/lock items, nodes, etc.)
 */
export default defineButton({
  id: CustomId.PlannerActions,
  data: { name: "planner-actions" },
  async execute(interaction, _t, helper, { action: a, navState }) {
    const [action, guid = "", actionType = ""] = a.split("|");
    const user = await helper.client.schemas.getUser(helper.user);
    const data = await SkyPlannerData.getSkyGamePlannerDataWithForUser(user.plannerData);
    const state = deserializeNavState(navState);

    if ((action as PlannerAction) === PlannerAction.ModifyTree) {
      await modifyTreeNode(guid, data, user, helper, state as NavigationState);
      return;
    }
    const getLoading = setLoadingState(interaction.message.components!, interaction.data.custom_id);
    await helper.update({ components: getLoading });

    let resultMessage = "";

    let followUp = true;

    switch (action as PlannerAction) {
      case PlannerAction.ToggleIAP: {
        const iap = data.iaps.find((i) => i.guid === guid);
        if (iap) {
          const isGifted = actionType === "gifted";
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
        switch (actionType) {
          case "all":
            data.wingedLights.forEach((w) => toggleWingedLightUnlock(user, w, true));
            resultMessage = `✅ Unlocked all (${data.wingedLights.filter((w) => !w.unlocked).length}) Winged Lights`;
            break;
          case "filtered": {
            const display = new WingedLightsDisplay(
              data,
              SkyPlannerData,
              { ...state, user: helper.user.id },
              user,
              helper.client,
            );
            const filtered = display.filterWls(data.wingedLights);
            filtered.forEach((wl) => toggleWingedLightUnlock(user, wl, true));
            resultMessage = `✅ Collected ${filtered.filter((w) => !w.unlocked).length} Winged Lights`;
            break;
          }
          case "reset":
            data.wingedLights.forEach((w) => toggleWingedLightUnlock(user, w, false));
            resultMessage = `🔒 Removed all Winged Lights`;
            break;
          default: {
            const wl = data.wingedLights.find((w) => w.guid === guid);
            if (wl) {
              toggleWingedLightUnlock(user, wl, !wl.unlocked);
              followUp = false;
            }
          }
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
        const isGifted = actionType === "gifted";
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
          const allNodes = getAllNodes(tree);
          unlockAllTreeNodes(user, allNodes);
          resultMessage = `✅ Unlocked entire tree`;
        }
        break;
      }

      case PlannerAction.LockTree: {
        const tree = data.spiritTrees.find((t) => t.guid === guid);
        if (tree) {
          const allNodes = getAllNodes(tree);
          lockAllTreeNodes(user, allNodes);
          resultMessage = `🔒 Locked entire tree`;
        }
        break;
      }

      case PlannerAction.ToggleListNode: {
        const ln = data.itemListNodes.find((l) => l.guid === guid);
        if (ln) {
          user.plannerData ??= PlannerDataHelper.createEmpty();
          if (ln.item.unlocked) {
            user.plannerData.unlocked = PlannerDataHelper.removeFromGuidString(user.plannerData.unlocked, ln.guid, ln.item.guid);
            adjustCurrencies(user, ln, true);
          } else {
            user.plannerData.unlocked = PlannerDataHelper.addToGuidString(user.plannerData.unlocked, ln.guid, ln.item.guid);
            adjustCurrencies(user, ln, false);
          }
          followUp = false;
          user.plannerData.date = new Date().toISOString();
        }
        break;
      }
      case PlannerAction.NestingRotation: {
        const rotationItem = nestingconfigs.rotations
          .find((r) => r.items.some((i) => i.guid === guid))
          ?.items.find((i) => i.guid === guid);
        if (rotationItem) rotationItem.item = data.items.find((i) => i.guid === rotationItem.guid);

        if (rotationItem) {
          modifyNestingRotationItems(user, rotationItem, actionType as "add" | "remove");
          followUp = false;
        }
      }
    }

    await user.save();

    const response = await handlePlannerNavigation(state, helper.user, helper.client);

    await helper.editReply({
      ...response,
      flags: MessageFlags.IsComponentsV2,
    });

    if (followUp) {
      await helper.followUp({
        content: resultMessage || "Action Completed",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
});
