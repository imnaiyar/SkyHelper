import { CustomId } from "@/utils/customId-store";
import { defineButton } from "@/structures";
import { ComponentType, MessageFlags, type APIModalInteractionResponseCallbackData } from "discord-api-types/v10";
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
} from "@/planner/helpers/action.utils";
import { fetchSkyData, handlePlannerNavigation, nestingconfigs, PlannerDataService, WingedLightsDisplay } from "@/planner";
import { setLoadingState } from "@/utils/loading";
import { PlannerAction, type NavigationState } from "@/types/planner";
import { modifyTreeNode } from "./sub/modify.tree.js";
import { DateTime } from "luxon";
import { shardsInfo, ShardsUtil } from "@skyhelperbot/utils";
import { buildShardEmbed } from "@/utils/classes/Embeds";
import { zone } from "@skyhelperbot/constants";
import { SpiritTreeHelper } from "skygame-data";
import { title } from "process";
import type { IPlannerFriend } from "@/planner/friends";

/**
 * Button handler for Sky Game Planner user actions (unlock/lock items, nodes, etc.)
 */
export default defineButton({
  id: CustomId.PlannerActions,
  data: { name: "planner-actions" },
  async execute(interaction, _t, helper, { action: a, navState }) {
    const [action, guid = "", actionType = ""] = a.split("|");
    const user = await helper.client.schemas.getUser(helper.user);

    user.plannerData ??= PlannerDataService.createEmpty();
    const data = PlannerDataService.resolveProgress(await fetchSkyData(helper.client), user.plannerData);

    // #region shards cleared
    if ((action as PlannerAction) === PlannerAction.ShardsCleared) {
      await helper.deferUpdate();

      const { currentShard, currentRealm } = ShardsUtil.shardsIndex(DateTime.now().setZone(zone));
      const info = shardsInfo[currentRealm]![currentShard]!;

      // if same date then cleared status was removed
      const cleared = PlannerDataService.shardsCleared(user.plannerData);
      if (cleared) {
        user.plannerData["shards.checkin"] = undefined;
        // substract shards rewards that was granted for clearing
        adjustCurrencies(user, { ac: info.ac }, false);
      } else {
        // otherwise cleared status was triggered
        user.plannerData["shards.checkin"] = DateTime.now().setZone(zone).toFormat("yyyy-MM-dd");
        adjustCurrencies(user, { ac: info.ac }, true);
      }
      await user.save();
      await helper.editReply(buildShardEmbed(DateTime.now().setZone(zone), _t, false, helper.user.id, !cleared));
      await helper.followUp({
        content: `Marked today's red shard as ${cleared ? "Uncleared" : "Cleared"}! ${info.ac} was ${cleared ? "removed" : "added"} to your planner currencies.\n-# Use ${helper.client.utils.mentionCommand(helper.client, "planner", "home")} to plan and track your sky progress.`,
        flags: 64,
      });
      return;
    }

    let resultMessage = "";

    if (!navState) throw new Error("Received undefined 'navState' where it was required");

    const state = deserializeNavState(navState);
    if ((action as PlannerAction) === PlannerAction.Friends) {
      switch (actionType) {
        case "add":
          await helper.launchModal(friendNameModal());
          return;
        case "edit": {
          const friend = user.plannerData.keys.friends?.friends.find((f: any) => f.guid === guid) as IPlannerFriend | undefined;
          if (!friend) throw new Error("Unknown friend: " + guid);
          await helper.launchModal(friendNameModal(friend));
          return;
        }
        case "delete":
          user.plannerData.keys.friends!.friends = (user.plannerData.keys.friends?.friends ?? []).filter(
            (f: any) => f.guid !== guid,
          );
          resultMessage = `✅ Removed friend`;
          state.it = undefined;
          break;
      }
    }

    if ((action as PlannerAction) === PlannerAction.ModifyTree) {
      await modifyTreeNode(guid, data, user, helper, state as NavigationState, actionType);
      return;
    }

    const getLoading = setLoadingState(interaction.message.components!, interaction.data.custom_id);
    await helper.update({ components: getLoading });

    let followUp = true;

    switch (action as PlannerAction) {
      case PlannerAction.ToggleIAP: {
        const iap = data.iaps.items.find((i) => i.guid === guid);
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
            data.wingedLights.items.forEach((w) => toggleWingedLightUnlock(user, w, true));
            resultMessage = `✅ Unlocked all (${data.wingedLights.items.filter((w) => !w.unlocked).length}) Winged Lights`;
            break;
          case "filtered": {
            const display = new WingedLightsDisplay(data, { ...state, user: helper.user.id }, user, helper.client);
            const filtered = display.filterWls(data.wingedLights.items);
            filtered.forEach((wl) => toggleWingedLightUnlock(user, wl, true));
            resultMessage = `✅ Collected ${filtered.filter((w) => !w.unlocked).length} Winged Lights`;
            break;
          }
          case "reset":
            data.wingedLights.items.forEach((w) => toggleWingedLightUnlock(user, w, false));
            resultMessage = `🔒 Removed all Winged Lights`;
            break;
          default: {
            const wl = data.wingedLights.items.find((w) => w.guid === guid);
            if (wl) {
              toggleWingedLightUnlock(user, wl, !wl.unlocked);
              followUp = false;
            }
          }
        }

        break;
      }

      case PlannerAction.ToggleFavorite: {
        const item = data.items.items.find((i) => i.guid === guid);
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
        const tree = data.spiritTrees.items.find((t) => t.guid === guid);
        if (tree) {
          const allNodes = SpiritTreeHelper.getNodes(tree);
          unlockAllTreeNodes(user, allNodes, actionType);
          resultMessage = `✅ Unlocked entire tree`;
        }
        break;
      }

      case PlannerAction.LockTree: {
        const tree = data.spiritTrees.items.find((t) => t.guid === guid);
        if (tree) {
          const allNodes = SpiritTreeHelper.getNodes(tree);
          lockAllTreeNodes(user, allNodes, actionType);
          resultMessage = `🔒 Locked entire tree`;
        }
        break;
      }

      case PlannerAction.ToggleListNode: {
        const ln = data.itemLists.items.flatMap((i) => i.items).find((iln) => iln.guid === guid);

        if (ln) {
          user.plannerData ??= PlannerDataService.createEmpty();
          if (ln.item.unlocked) {
            user.plannerData.unlocked = PlannerDataService.removeFromGuidString(user.plannerData.unlocked, ln.guid, ln.item.guid);
            adjustCurrencies(user, ln, true);
          } else {
            user.plannerData.unlocked = PlannerDataService.addToGuidString(user.plannerData.unlocked, ln.guid, ln.item.guid);
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
        if (rotationItem) rotationItem.item = data.items.items.find((i) => i.guid === rotationItem.guid);

        if (rotationItem) {
          modifyNestingRotationItems(user, rotationItem, actionType as "add" | "remove");
          followUp = false;
        }
        break;
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

function friendNameModal(friend?: IPlannerFriend): APIModalInteractionResponseCallbackData {
  return {
    title: friend ? "Edit Friend Name" : "Add New Friend",
    custom_id: "planner-friend-name-modal" + `|${friend ? friend.guid : ""}`,
    components: [
      {
        type: ComponentType.Label,
        label: "Friend Name",
        description: "Enter a custom name for your friend",
        component: {
          type: ComponentType.TextInput,
          custom_id: "friend-name-input",
          style: 1,
          min_length: 1,
          max_length: 50,
          placeholder: "Friend Name",
          value: friend?.name ?? undefined,
        },
      },
    ],
  };
}
