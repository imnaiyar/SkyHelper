import { getPlannerData } from "@/schemas/PlannerData";
import { SkyPlannerData } from "@skyhelperbot/constants";
import { container, section, separator, textDisplay } from "@skyhelperbot/utils";
import { MessageFlags } from "discord-api-types/v10";

/**
 * Get user's planner statistics
 * @param userId User ID
 * @returns Statistics object
 */
export async function getUserPlannerStats(userId: string) {
  const userData = await getPlannerData(userId);
  const data = await SkyPlannerData.getSkyGamePlannerData();

  // Calculate statistics
  const totalItems = data.items.length;
  const unlockedItems = userData.unlockedItems.length;
  const itemsPercentage = totalItems > 0 ? Math.round((unlockedItems / totalItems) * 100) : 0;

  const totalNodes = data.nodes.length;
  const unlockedNodes = userData.unlockedNodes.length;
  const nodesPercentage = totalNodes > 0 ? Math.round((unlockedNodes / totalNodes) * 100) : 0;

  const totalWLs = data.wingedLights.length;
  const collectedWLs = userData.collectedWLs.length;
  const wlsPercentage = totalWLs > 0 ? Math.round((collectedWLs / totalWLs) * 100) : 0;

  // Calculate spirit completion
  const spiritsStats = data.spirits.map((spirit) => {
    const spiritTree = data.spiritTrees.find((tree) => tree.spirit?.guid === spirit.guid);
    if (!spiritTree?.node) return { spirit, total: 0, unlocked: 0 };

    const nodes: any[] = [];
    function collectNodes(node: any) {
      nodes.push(node);
      if (node.nw) collectNodes(node.nw);
      if (node.ne) collectNodes(node.ne);
      if (node.n) collectNodes(node.n);
    }
    collectNodes(spiritTree.node);

    const total = nodes.length;
    const unlocked = nodes.filter((n) => userData.unlockedNodes.includes(n.guid)).length;

    return { spirit, total, unlocked };
  });

  const completedSpirits = spiritsStats.filter((s) => s.total > 0 && s.unlocked === s.total).length;
  const totalSpirits = spiritsStats.filter((s) => s.total > 0).length;
  const spiritsPercentage = totalSpirits > 0 ? Math.round((completedSpirits / totalSpirits) * 100) : 0;

  return {
    items: {
      total: totalItems,
      unlocked: unlockedItems,
      percentage: itemsPercentage,
    },
    nodes: {
      total: totalNodes,
      unlocked: unlockedNodes,
      percentage: nodesPercentage,
    },
    wls: {
      total: totalWLs,
      collected: collectedWLs,
      percentage: wlsPercentage,
    },
    spirits: {
      total: totalSpirits,
      completed: completedSpirits,
      percentage: spiritsPercentage,
    },
    resources: {
      candles: userData.candles,
      hearts: userData.hearts,
      ascendedCandles: userData.ascendedCandles,
      seasonalCandles: userData.seasonalCandles,
      wingBuffs: userData.wingBuffs,
    },
  };
}

/**
 * Render user planner statistics as a message
 * @param userId User ID
 * @returns Message components
 */
export async function renderPlannerStats(userId: string) {
  const stats = await getUserPlannerStats(userId);

  return {
    components: [
      container(
        textDisplay("# Your Sky Progress"),
        separator(),
        textDisplay("## Collection Progress"),
        textDisplay(`**Items:** ${stats.items.unlocked}/${stats.items.total} (${stats.items.percentage}%)`),
        textDisplay(`**Nodes:** ${stats.nodes.unlocked}/${stats.nodes.total} (${stats.nodes.percentage}%)`),
        textDisplay(`**Winged Lights:** ${stats.wls.collected}/${stats.wls.total} (${stats.wls.percentage}%)`),
        textDisplay(`**Spirits Completed:** ${stats.spirits.completed}/${stats.spirits.total} (${stats.spirits.percentage}%)`),
        separator(),
        textDisplay("## Resources"),
        textDisplay(`**Candles:** ${stats.resources.candles}`),
        textDisplay(`**Hearts:** ${stats.resources.hearts}`),
        textDisplay(`**Ascended Candles:** ${stats.resources.ascendedCandles}`),
        textDisplay(`**Seasonal Candles:** ${stats.resources.seasonalCandles}`),
        textDisplay(`**Wing Buffs:** ${stats.resources.wingBuffs}`),
      ),
    ],
    flags: MessageFlags.IsComponentsV2,
  };
}
