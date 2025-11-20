/**
 * Utility functions for managing user planner data
 */
import type { DisplayTabs, NavigationState, PlannerAction } from "@/types/planner";
import type { UserSchema } from "@/types/schemas";
import { CustomId, store } from "@/utils/customId-store";
import { PlannerDataService } from "./data.service.js";
import type { ICost, INode, IWingedLight } from "skygame-data";
import type { IItem } from "skygame-data";
import type { IIAP } from "skygame-data";
import type { IRotationItem } from "../shops/config.js";
import { CostUtils } from "./cost.utils.js";

// ============================================================================
// Currency Adjustment Helpers
// ============================================================================

/**
 * Adjust user currencies based on item cost
 * @param user User schema to adjust currencies for
 * @param cost The cost object containing currency amounts
 * @param add Whether to add (refund) or subtract (spend) currencies
 * @param seasonGuid Optional season GUID for season-specific currencies
 * @param eventGuid Optional event GUID for event-specific currencies
 */
export function adjustCurrencies(
  user: UserSchema,
  cost: { c?: number; h?: number; sc?: number; sh?: number; ac?: number; ec?: number },
  add: boolean,
  seasonGuid?: string,
  eventGuid?: string,
) {
  user.plannerData ??= PlannerDataService.createEmpty();
  const currencies = user.plannerData.currencies;
  const multiplier = add ? 1 : -1;
  // Adjust regular currencies (candles, hearts, ascended candles)
  if (cost.c) {
    const newAmount = currencies.candles + cost.c * multiplier;
    currencies.candles = Math.max(0, newAmount);
  }

  if (cost.h) {
    const newAmount = currencies.hearts + cost.h * multiplier;
    currencies.hearts = Math.max(0, newAmount);
  }

  if (cost.ac) {
    const newAmount = currencies.ascendedCandles + cost.ac * multiplier;
    currencies.ascendedCandles = Math.max(0, newAmount);
  }

  // Adjust season-specific currencies
  if (seasonGuid && (cost.sc || cost.sh)) {
    currencies.seasonCurrencies[seasonGuid] ??= { candles: 0, hearts: 0 };

    if (cost.sc) {
      const newAmount = currencies.seasonCurrencies[seasonGuid].candles + cost.sc * multiplier;
      currencies.seasonCurrencies[seasonGuid].candles = Math.max(0, newAmount);
    }

    if (cost.sh) {
      const currentHearts = currencies.seasonCurrencies[seasonGuid].hearts ?? 0;
      const newAmount = currentHearts + cost.sh * multiplier;
      currencies.seasonCurrencies[seasonGuid].hearts = Math.max(0, newAmount);
    }
    user.markModified("plannerData.currencies.seasonCurrencies");
  }

  // Adjust event-specific currencies
  if (eventGuid && cost.ec) {
    currencies.eventCurrencies[eventGuid] ??= { tickets: 0 };
    const newAmount = currencies.eventCurrencies[eventGuid].tickets + cost.ec * multiplier;
    currencies.eventCurrencies[eventGuid].tickets = Math.max(0, newAmount);
    user.markModified("plannerData.currencies.eventCurrencies");
  }
}

/**
 * Get the season/event context for a node/item to determine which currency pool to adjust
 */
function getCurrencyContext(node?: INode, item?: IItem): { seasonGuid?: string; eventGuid?: string } {
  // Check if this is from a spirit tree with season or event context
  let seasonGuid: string | undefined;
  let eventGuid: string | undefined;

  if (node?.root?.spiritTree) {
    const tree = node.root.spiritTree;
    // Check for season context
    if (tree.spirit?.season) {
      seasonGuid = tree.spirit.season.guid;
    }
    // Check for event context
    if (tree.eventInstanceSpirit?.eventInstance) {
      eventGuid = tree.eventInstanceSpirit.eventInstance.guid;
    }
  }

  if (item?.season) {
    seasonGuid = item.season.guid;
  }

  return { seasonGuid, eventGuid };
}

// ============================================================================
// Item and Node Toggle Functions
// ============================================================================

/**
 * Toggle an item's unlocked status for a user
 */
export function toggleItemUnlock(user: UserSchema, item: IItem, unlock: boolean) {
  user.plannerData ??= PlannerDataService.createEmpty();

  if (!unlock) {
    // Lock item and its nodes
    user.plannerData.unlocked = PlannerDataService.removeFromGuidString(
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
    user.plannerData.unlocked = PlannerDataService.addToGuidString(user.plannerData.unlocked, item.guid);
  }

  user.plannerData.date = new Date().toISOString();
  return !unlock;
}

/**
 * Toggle a node's unlocked status for a user
 */
export function toggleNodeUnlock(user: UserSchema, node: INode, unlock: boolean) {
  user.plannerData ??= PlannerDataService.createEmpty();

  // Get currency context (season/event) for this node
  const { seasonGuid, eventGuid } = getCurrencyContext(node, node.item);

  if (!unlock) {
    const guidsToRemove = [node.guid];

    // only add currency if it was previously unlocked
    if (node.item?.unlocked) adjustCurrencies(user, node, true, seasonGuid, eventGuid);

    node.unlocked = false;

    // Also lock the item if it exists
    if (node.item) toggleItemUnlock(user, node.item, false);

    // Lock hidden items
    node.hiddenItems?.forEach((item) => toggleItemUnlock(user, item, false));

    user.plannerData.unlocked = PlannerDataService.removeFromGuidString(user.plannerData.unlocked, ...guidsToRemove);
  } else {
    // Unlock node - spend currency
    const guidsToAdd: string[] = [];

    if (!node.item?.unlocked) {
      guidsToAdd.push(node.guid);
      node.unlocked = true;

      // Spend currency for this node
      adjustCurrencies(user, node, false, seasonGuid, eventGuid);
    }
    if (node.item) toggleItemUnlock(user, node.item, true);

    // Unlock hidden items
    node.hiddenItems?.forEach((item) => toggleItemUnlock(user, item, true));

    user.plannerData.unlocked = PlannerDataService.addToGuidString(user.plannerData.unlocked, ...guidsToAdd);
  }

  user.plannerData.date = new Date().toISOString();

  return unlock;
}

/**
 * Toggle an IAP's bought/gifted status for a user
 */
export function toggleIAPStatus(user: UserSchema, iap: IIAP, gifted = false): "bought" | "gifted" | "locked" {
  user.plannerData ??= PlannerDataService.createEmpty();

  const isCurrentlyActive = gifted ? iap.gifted : iap.bought;
  const targetField = gifted ? "gifted" : "unlocked";
  const otherField = gifted ? "unlocked" : "gifted";
  let status: "bought" | "gifted" | "locked";
  if (isCurrentlyActive) {
    // Remove from current field and lock items
    user.plannerData[targetField] = PlannerDataService.removeFromGuidString(user.plannerData[targetField], iap.guid);
    iap.items?.forEach((item) => toggleItemUnlock(user, item, false));
    status = "locked";
  } else {
    // Add to current field and unlock items
    user.plannerData[targetField] = PlannerDataService.addToGuidString(user.plannerData[targetField], iap.guid);
    iap.items?.forEach((item) => toggleItemUnlock(user, item, true));
    status = gifted ? "gifted" : "bought";
  }

  // remove from the other field to ensure mutual exclusivity
  user.plannerData[otherField] = PlannerDataService.removeFromGuidString(user.plannerData[otherField], iap.guid);

  user.plannerData.date = new Date().toISOString();
  return status;
}

/**
 * Toggle a winged light's unlocked status for a user
 */
export function toggleWingedLightUnlock(user: UserSchema, wl: IWingedLight, unlock = false) {
  user.plannerData ??= PlannerDataService.createEmpty();

  if (!unlock) {
    user.plannerData.wingedLights = PlannerDataService.removeFromGuidString(user.plannerData.wingedLights, wl.guid);
  } else {
    user.plannerData.wingedLights = PlannerDataService.addToGuidString(user.plannerData.wingedLights, wl.guid);
  }

  user.plannerData.date = new Date().toISOString();
  return unlock;
}

/**
 * Toggle an item's favorite status for a user
 */
export function toggleItemFavorite(user: UserSchema, item: IItem) {
  user.plannerData ??= PlannerDataService.createEmpty();

  const isFavorited = PlannerDataService.hasGuid(user.plannerData.favourites, item.guid);

  if (isFavorited) {
    user.plannerData.favourites = PlannerDataService.removeFromGuidString(user.plannerData.favourites, item.guid);
  } else {
    user.plannerData.favourites = PlannerDataService.addToGuidString(user.plannerData.favourites, item.guid);
  }

  user.plannerData.date = new Date().toISOString();

  return !isFavorited;
}

/**
 * Toggle a season pass ownership for a user
 */
export function toggleSeasonPass(user: UserSchema, seasonGuid: string, gifted = false): "owned" | "gifted" | "none" {
  user.plannerData ??= PlannerDataService.createEmpty();

  const hasSeasonPass = PlannerDataService.hasGuid(user.plannerData.seasonPasses, seasonGuid);

  if (hasSeasonPass) {
    // Remove season pass
    user.plannerData.seasonPasses = PlannerDataService.removeFromGuidString(user.plannerData.seasonPasses, seasonGuid);
    user.plannerData.gifted = PlannerDataService.removeFromGuidString(user.plannerData.gifted, seasonGuid);

    user.plannerData.date = new Date().toISOString();
    return "none";
  } else {
    // Add season pass
    user.plannerData.seasonPasses = PlannerDataService.addToGuidString(user.plannerData.seasonPasses, seasonGuid);

    if (gifted) {
      user.plannerData.gifted = PlannerDataService.addToGuidString(user.plannerData.gifted, seasonGuid);
    } else {
      user.plannerData.gifted = PlannerDataService.removeFromGuidString(user.plannerData.gifted, seasonGuid);
    }

    user.plannerData.date = new Date().toISOString();

    return gifted ? "gifted" : "owned";
  }
}

/**
 * Unlock all nodes in a spirit tree for a user
 */
export function unlockAllTreeNodes(user: UserSchema, nodes: INode[]) {
  user.plannerData ??= PlannerDataService.createEmpty();

  const guidsToAdd: string[] = [];

  // Get currency context from the first node (all nodes in tree should have same context)
  const firstNode = nodes[0];
  const { seasonGuid, eventGuid } = firstNode ? getCurrencyContext(firstNode, firstNode.item) : {};

  nodes.forEach((node) => {
    if (node.item?.unlocked) return;
    guidsToAdd.push(node.guid);
    if (node.item) {
      guidsToAdd.push(node.item.guid);
    }
    node.hiddenItems?.forEach((item) => guidsToAdd.push(item.guid));

    // Spend currency for this node
    adjustCurrencies(user, node, false, seasonGuid, eventGuid);
  });

  user.plannerData.unlocked = PlannerDataService.addToGuidString(user.plannerData.unlocked, ...guidsToAdd);
  user.plannerData.date = new Date().toISOString();
}

/**
 * Lock all nodes in a spirit tree for a user
 */
export function lockAllTreeNodes(user: UserSchema, nodes: INode[]) {
  user.plannerData ??= PlannerDataService.createEmpty();

  const guidsToRemove: string[] = [];

  // Get currency context from the first node (all nodes in tree should have same context)
  const firstNode = nodes[0];
  const { seasonGuid, eventGuid } = firstNode ? getCurrencyContext(firstNode, firstNode.item) : {};

  nodes.forEach((node) => {
    guidsToRemove.push(node.guid);
    if (node.item) {
      guidsToRemove.push(node.item.guid);

      if (node.item.unlocked) adjustCurrencies(user, node, true, seasonGuid, eventGuid);
    }
    node.hiddenItems?.forEach((item) => guidsToRemove.push(item.guid));
  });

  user.plannerData.unlocked = PlannerDataService.removeFromGuidString(user.plannerData.unlocked, ...guidsToRemove);
  user.plannerData.date = new Date().toISOString();
}

export function modifyNestingRotationItems(user: UserSchema, item: IRotationItem, type: "add" | "remove") {
  user.plannerData ??= PlannerDataService.createEmpty();
  // eslint-disable-next-line
  user.plannerData.keys ??= {};
  const itemState = (user.plannerData.keys["nesting-workshop"]?.unlocked?.[item.guid] ?? { q: 0, cost: {} }) as {
    q: number;
    cost: ICost;
  };
  const costType = CostUtils.getCostKey(item)!;
  if (type === "add") {
    itemState.q += 1;
    adjustCurrencies(user, item, false);
    user.plannerData.unlocked = PlannerDataService.addToGuidString(user.plannerData.unlocked, item.guid);
  } else {
    itemState.q -= 1;
    if (itemState.q <= 0) {
      user.plannerData.unlocked = PlannerDataService.removeFromGuidString(user.plannerData.unlocked, item.guid);
    }
    // do not keep adding if it somehow goes into negatives
    if (itemState.q >= 0) adjustCurrencies(user, item, true);
  }

  user.plannerData.keys["nesting-workshop"] ??= { unlocked: {} };
  itemState.cost = { [costType]: item[costType]! * itemState.q };

  if (itemState.q <= 0) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete user.plannerData.keys["nesting-workshop"].unlocked[item.guid];
  } else {
    user.plannerData.keys["nesting-workshop"].unlocked[item.guid] = itemState;
  }

  user.plannerData.date = new Date().toISOString();
  user.markModified("plannerData.keys");
  return type;
}

export function createActionId(opt: {
  action: PlannerAction;
  guid?: string;
  gifted?: string;
  actionType?: string;
  navState?: Partial<NavigationState>;
}) {
  return store.serialize(CustomId.PlannerActions, {
    action: opt.action + "|" + (opt.guid ?? "") + "|" + (opt.actionType ?? ""),
    navState: opt.navState && "t" in opt.navState ? serializeNavState(opt.navState) : null,
    user: opt.navState?.user,
  });
}
export function serializeNavState(state: Partial<NavigationState>) {
  const parts = [state.t, state.it ?? "", state.p ?? "", state.f ?? "", state.d ?? "", state.i ?? "", state.v ?? ""];

  let result = parts.join("|");

  if (state.b) {
    // Recursively encode the 'b' property (which is the same structure minus b and v)
    result += "~" + serializeNavState(state.b as NavigationState);
  }

  return result;
}

export function deserializeNavState(str: string) {
  // Split on the first '~' to separate main data from nested 'b'
  const tildaIndex = str.indexOf("~");
  const mainPart = tildaIndex === -1 ? str : str.substring(0, tildaIndex);
  const bPart = tildaIndex === -1 ? null : str.substring(tildaIndex + 1);

  // Parse main parts
  const parts = mainPart.split("|");

  const state: Omit<NavigationState, "user"> = {
    t: parts[0]! as DisplayTabs,
    it: parts[1],
    p: parts[2] ? parseInt(parts[2]) : undefined,
    f: parts[3],
    d: parts[4],
    i: parts[5],
    v: parts[6] ? parts[6].split(",") : undefined,
  };

  // Recursively deserialize 'b' if present
  if (bPart) {
    state.b = deserializeNavState(bPart);
  }

  // clean up empty fields
  Object.keys(state).forEach((key) => {
    if (!state[key as keyof typeof state]) {
      // eslint-disable-next-line
      delete state[key as keyof typeof state];
    }
  });

  return state;
}
