import Utils from "@/utils/classes/Utils";
import { currency } from "@skyhelperbot/constants";
import { createEmojiProgressBar } from "@skyhelperbot/utils";
import type { ICost } from "skygame-data";
import type { INode } from "skygame-data";

/**
 * Returns progress bar (in the form of emojis) and cost progress for the given nodes
 * @param nodes The  nodes to calculate progress for
 * @param withCost whether to include cost stats or not
 * @returns
 */
export function getNodeProgress(nodes: INode[], withCost = true) {
  const progress = nodes.length ? Math.round((nodes.filter((n) => n.unlocked).length / nodes.length) * 100) : null;
  if (progress === null) return null;
  const formatCurrency = (c: ReturnType<typeof calculateTierCosts>) => {
    const formatted: string[] = [];
    if (c.candles.cost) formatted.push(`${c.candles.spent}/${c.candles.cost} ${Utils.formatEmoji(currency.c, "Candles")}`);
    if (c.hearts.cost) formatted.push(`${c.hearts.spent}/${c.hearts.cost} ${Utils.formatEmoji(currency.h, "Hearts")}`);
    if (c.acs.cost) formatted.push(`${c.acs.spent}/${c.acs.cost} ${Utils.formatEmoji(currency.ac, "ACs")}`);
    return formatted.join(" ");
  };
  return `${createEmojiProgressBar(progress)}${withCost ? ` (${formatCurrency(calculateTierCosts(nodes))})` : ""}`;
}

export function calculateTierCosts(nodes: INode[]) {
  const getNodeCosts = (type: keyof ICost) => {
    return nodes.reduce(
      (acc, tn) => {
        acc.cost += tn[type] ?? 0;
        acc.spent += tn[type] && tn.unlocked ? tn[type] : 0;
        return acc;
      },
      { cost: 0, spent: 0 },
    );
  };
  return {
    candles: getNodeCosts("c"),
    hearts: getNodeCosts("h"),
    acs: getNodeCosts("ac"),
  };
}
