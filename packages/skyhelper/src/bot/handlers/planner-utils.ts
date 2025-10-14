/**
 * Utility functions for managing user planner data
 */
import type { NavigationState } from "@/types/planner";
import type { UserSchema } from "@/types/schemas";
import { CustomId, store } from "@/utils/customId-store";
import { PlannerDataHelper } from "@skyhelperbot/constants/skygame-planner";
import type { IIAP, IItem, IItemListNode, INode, IWingedLight } from "@skyhelperbot/constants/skygame-planner";

/**
 * Toggle an item's unlocked status for a user
 */
export function toggleItemUnlock(user: UserSchema, item: IItem, unlock: boolean) {
  user.plannerData ??= PlannerDataHelper.createEmpty();

  if (!unlock) {
    // Lock item and its nodes
    user.plannerData.unlocked = PlannerDataHelper.removeFromGuidString(
      user.plannerData.unlocked,
      item.guid,
      ...(item.nodes?.map((n) => n.guid) ?? []),
      ...(item.hiddenNodes?.map((n) => n.guid) ?? []),
    );
    item.unlocked = false;
    item.nodes?.forEach((n) => (n.unlocked = false));
    item.hiddenNodes?.forEach((n) => (n.unlocked = false));
  } else {
    // Unlock item
    item.unlocked = true;
    user.plannerData.unlocked = PlannerDataHelper.addToGuidString(user.plannerData.unlocked, item.guid);
  }

  user.plannerData.date = new Date().toISOString();
  return !unlock;
}

/**
 * Toggle a node's unlocked status for a user
 */
export function toggleNodeUnlock(user: UserSchema, node: INode, unlock: boolean) {
  user.plannerData ??= PlannerDataHelper.createEmpty();

  if (!unlock) {
    // Lock node
    const guidsToRemove = [node.guid];
    node.unlocked = false;

    // Also lock the item if it exists
    if (node.item) toggleItemUnlock(user, node.item, false);

    // Lock hidden items
    node.hiddenItems?.forEach((item) => toggleItemUnlock(user, item, false));

    user.plannerData.unlocked = PlannerDataHelper.removeFromGuidString(user.plannerData.unlocked, ...guidsToRemove);
  } else {
    // Unlock node
    const guidsToAdd: string[] = [];

    const unlockNode = (n: INode) => {
      if (!n.item?.unlocked) {
        guidsToAdd.push(n.guid);
        node.unlocked = true;
      }
      if (n.item) toggleItemUnlock(user, n.item, true);

      // Unlock hidden items
      n.hiddenItems?.forEach((item) => toggleItemUnlock(user, item, true));
    };

    unlockNode(node);

    // also unlock previous node
    let currentNode = node;
    while (currentNode.prev) {
      unlockNode(currentNode.prev);

      currentNode = currentNode.prev;
    }

    user.plannerData.unlocked = PlannerDataHelper.addToGuidString(user.plannerData.unlocked, ...guidsToAdd);
  }

  user.plannerData.date = new Date().toISOString();

  return unlock;
}

/**
 * Toggle an IAP's bought/gifted status for a user
 */
export function toggleIAPStatus(user: UserSchema, iap: IIAP, gifted = false): "bought" | "gifted" | "locked" {
  user.plannerData ??= PlannerDataHelper.createEmpty();

  const isUnlocked = PlannerDataHelper.hasGuid(user.plannerData.unlocked, iap.guid);
  const isGifted = PlannerDataHelper.hasGuid(user.plannerData.gifted, iap.guid);

  if (isUnlocked) {
    // Lock IAP
    user.plannerData.unlocked = PlannerDataHelper.removeFromGuidString(user.plannerData.unlocked, iap.guid);
    user.plannerData.gifted = PlannerDataHelper.removeFromGuidString(user.plannerData.gifted, iap.guid);

    // Lock related items
    iap.items?.forEach((item) => {
      user.plannerData!.unlocked = PlannerDataHelper.removeFromGuidString(user.plannerData!.unlocked, item.guid);
    });

    user.plannerData.date = new Date().toISOString();

    return "locked";
  } else {
    // Unlock IAP
    user.plannerData.unlocked = PlannerDataHelper.addToGuidString(user.plannerData.unlocked, iap.guid);

    if (gifted) {
      user.plannerData.gifted = PlannerDataHelper.addToGuidString(user.plannerData.gifted, iap.guid);
    } else {
      user.plannerData.gifted = PlannerDataHelper.removeFromGuidString(user.plannerData.gifted, iap.guid);
    }

    // Unlock related items
    iap.items?.forEach((item) => {
      user.plannerData!.unlocked = PlannerDataHelper.addToGuidString(user.plannerData!.unlocked, item.guid);
    });

    user.plannerData.date = new Date().toISOString();

    return gifted ? "gifted" : "bought";
  }
}

/**
 * Toggle an item list node's unlocked status for a user
 */
export function toggleItemListNodeUnlock(user: UserSchema, node: IItemListNode) {
  user.plannerData ??= PlannerDataHelper.createEmpty();

  const isUnlocked = PlannerDataHelper.hasGuid(user.plannerData.unlocked, node.guid);

  if (isUnlocked) {
    // Lock node and item
    const guidsToRemove = [node.guid, node.item.guid];
    user.plannerData.unlocked = PlannerDataHelper.removeFromGuidString(user.plannerData.unlocked, ...guidsToRemove);
  } else {
    // Unlock node and item
    const guidsToAdd = [node.guid, node.item.guid];
    user.plannerData.unlocked = PlannerDataHelper.addToGuidString(user.plannerData.unlocked, ...guidsToAdd);
  }

  user.plannerData.date = new Date().toISOString();

  return !isUnlocked;
}

/**
 * Toggle a winged light's unlocked status for a user
 */
export function toggleWingedLightUnlock(user: UserSchema, wl: IWingedLight) {
  user.plannerData ??= PlannerDataHelper.createEmpty();

  const isUnlocked = PlannerDataHelper.hasGuid(user.plannerData.wingedLights, wl.guid);

  if (isUnlocked) {
    user.plannerData.wingedLights = PlannerDataHelper.removeFromGuidString(user.plannerData.wingedLights, wl.guid);
  } else {
    user.plannerData.wingedLights = PlannerDataHelper.addToGuidString(user.plannerData.wingedLights, wl.guid);
  }

  user.plannerData.date = new Date().toISOString();
  return !isUnlocked;
}

/**
 * Toggle an item's favorite status for a user
 */
export function toggleItemFavorite(user: UserSchema, item: IItem) {
  user.plannerData ??= PlannerDataHelper.createEmpty();

  const isFavorited = PlannerDataHelper.hasGuid(user.plannerData.favourites, item.guid);

  if (isFavorited) {
    user.plannerData.favourites = PlannerDataHelper.removeFromGuidString(user.plannerData.favourites, item.guid);
  } else {
    user.plannerData.favourites = PlannerDataHelper.addToGuidString(user.plannerData.favourites, item.guid);
  }

  user.plannerData.date = new Date().toISOString();

  return !isFavorited;
}

/**
 * Toggle a season pass ownership for a user
 */
export function toggleSeasonPass(user: UserSchema, seasonGuid: string, gifted = false): "owned" | "gifted" | "none" {
  user.plannerData ??= PlannerDataHelper.createEmpty();

  const hasSeasonPass = PlannerDataHelper.hasGuid(user.plannerData.seasonPasses, seasonGuid);
  const isGifted = PlannerDataHelper.hasGuid(user.plannerData.gifted, seasonGuid);

  if (hasSeasonPass) {
    // Remove season pass
    user.plannerData.seasonPasses = PlannerDataHelper.removeFromGuidString(user.plannerData.seasonPasses, seasonGuid);
    user.plannerData.gifted = PlannerDataHelper.removeFromGuidString(user.plannerData.gifted, seasonGuid);

    user.plannerData.date = new Date().toISOString();
    return "none";
  } else {
    // Add season pass
    user.plannerData.seasonPasses = PlannerDataHelper.addToGuidString(user.plannerData.seasonPasses, seasonGuid);

    if (gifted) {
      user.plannerData.gifted = PlannerDataHelper.addToGuidString(user.plannerData.gifted, seasonGuid);
    } else {
      user.plannerData.gifted = PlannerDataHelper.removeFromGuidString(user.plannerData.gifted, seasonGuid);
    }

    user.plannerData.date = new Date().toISOString();

    return gifted ? "gifted" : "owned";
  }
}

/**
 * Unlock all nodes in a spirit tree for a user
 */
export function unlockAllTreeNodes(user: UserSchema, nodes: INode[]) {
  user.plannerData ??= PlannerDataHelper.createEmpty();

  const guidsToAdd: string[] = [];

  nodes.forEach((node) => {
    if (node.item?.unlocked) return;
    guidsToAdd.push(node.guid);
    if (node.item) {
      guidsToAdd.push(node.item.guid);
    }
    node.hiddenItems?.forEach((item) => guidsToAdd.push(item.guid));
  });

  user.plannerData.unlocked = PlannerDataHelper.addToGuidString(user.plannerData.unlocked, ...guidsToAdd);
  user.plannerData.date = new Date().toISOString();
}

/**
 * Lock all nodes in a spirit tree for a user
 */
export function lockAllTreeNodes(user: UserSchema, nodes: INode[]) {
  user.plannerData ??= PlannerDataHelper.createEmpty();

  const guidsToRemove: string[] = [];

  nodes.forEach((node) => {
    guidsToRemove.push(node.guid);
    if (node.item) {
      guidsToRemove.push(node.item.guid);
    }
    node.hiddenItems?.forEach((item) => guidsToRemove.push(item.guid));
  });

  user.plannerData.unlocked = PlannerDataHelper.removeFromGuidString(user.plannerData.unlocked, ...guidsToRemove);
  user.plannerData.date = new Date().toISOString();
}

export function createActionId(opt: {
  action: string;
  guid?: string;
  gifted?: string;
  actionType?: string;
  navState: NavigationState;
}) {
  return store.serialize(CustomId.PlannerActions, {
    action: opt.action,
    guid: opt.guid ?? "",
    gifted: opt.gifted ?? null,
    actionType: opt.actionType ?? null,
    navState: JSON.stringify({
      t: opt.navState.t,
      it: opt.navState.it,
      p: opt.navState.p,
      f: opt.navState.f,
      d: opt.navState.d,
      b: opt.navState.b,
      v: opt.navState.v,
    }),
    user: opt.navState.user,
  });
}
