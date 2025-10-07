import { getPlannerData, updatePlannerData, type UserPlannerData } from "@/schemas/PlannerData";

/**
 * Import planner data from sky-planner.com format
 * @param userId User ID
 * @param importData Import data in sky-planner.com format
 * @returns Success message or error
 */
export async function importPlannerData(userId: string, importData: any): Promise<string> {
  try {
    // Validate import data structure
    if (!importData || typeof importData !== "object") {
      throw new Error("Invalid import data format");
    }

    const updates: Partial<Omit<UserPlannerData, "_id" | "updatedAt">> = {};

    // Import unlocked items
    if (Array.isArray(importData.unlockedItems)) {
      updates.unlockedItems = importData.unlockedItems;
    } else if (importData.c?.items && typeof importData.c.items === "object") {
      // sky-planner.com format: c.items is an object with item GUIDs as keys
      updates.unlockedItems = Object.keys(importData.c.items);
    }

    // Import unlocked nodes
    if (Array.isArray(importData.unlockedNodes)) {
      updates.unlockedNodes = importData.unlockedNodes;
    } else if (importData.c?.nodes && typeof importData.c.nodes === "object") {
      // sky-planner.com format: c.nodes is an object with node GUIDs as keys
      updates.unlockedNodes = Object.keys(importData.c.nodes);
    }

    // Import collected WLs
    if (Array.isArray(importData.collectedWLs)) {
      updates.collectedWLs = importData.collectedWLs;
    } else if (importData.c?.wingedLights && typeof importData.c.wingedLights === "object") {
      // sky-planner.com format: c.wingedLights is an object with WL GUIDs as keys
      updates.collectedWLs = Object.keys(importData.c.wingedLights);
    }

    // Import resources
    if (typeof importData.candles === "number") {
      updates.candles = importData.candles;
    } else if (typeof importData.c?.candles === "number") {
      updates.candles = importData.c.candles;
    }

    if (typeof importData.hearts === "number") {
      updates.hearts = importData.hearts;
    } else if (typeof importData.c?.hearts === "number") {
      updates.hearts = importData.c.hearts;
    }

    if (typeof importData.ascendedCandles === "number") {
      updates.ascendedCandles = importData.ascendedCandles;
    } else if (typeof importData.c?.ascendedCandles === "number") {
      updates.ascendedCandles = importData.c.ascendedCandles;
    }

    if (typeof importData.seasonalCandles === "number") {
      updates.seasonalCandles = importData.seasonalCandles;
    } else if (typeof importData.c?.sc === "number") {
      updates.seasonalCandles = importData.c.sc;
    }

    if (typeof importData.wingBuffs === "number") {
      updates.wingBuffs = importData.wingBuffs;
    }

    // Update the data
    await updatePlannerData(userId, updates);

    const itemCount = updates.unlockedItems?.length ?? 0;
    const nodeCount = updates.unlockedNodes?.length ?? 0;
    const wlCount = updates.collectedWLs?.length ?? 0;

    return `Successfully imported planner data:\n- ${itemCount} items\n- ${nodeCount} nodes\n- ${wlCount} winged lights\n- Resources and currencies`;
  } catch (error) {
    console.error("Error importing planner data:", error);
    throw new Error(`Failed to import data: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Export planner data in sky-planner.com compatible format
 * @param userId User ID
 * @returns Export data in sky-planner.com format
 */
export async function exportPlannerData(userId: string): Promise<any> {
  try {
    const data = await getPlannerData(userId);

    // Export in sky-planner.com format
    return {
      c: {
        items: Object.fromEntries(data.unlockedItems.map((id) => [id, { unlock: true }])),
        nodes: Object.fromEntries(data.unlockedNodes.map((id) => [id, { unlock: true }])),
        wingedLights: Object.fromEntries(data.collectedWLs.map((id) => [id, { unlock: true }])),
        candles: data.candles,
        hearts: data.hearts,
        ascendedCandles: data.ascendedCandles,
        sc: data.seasonalCandles,
      },
      // Also include our own format for easier re-import
      unlockedItems: data.unlockedItems,
      unlockedNodes: data.unlockedNodes,
      collectedWLs: data.collectedWLs,
      candles: data.candles,
      hearts: data.hearts,
      ascendedCandles: data.ascendedCandles,
      seasonalCandles: data.seasonalCandles,
      wingBuffs: data.wingBuffs,
      exportedAt: data.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error exporting planner data:", error);
    throw new Error(`Failed to export data: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
