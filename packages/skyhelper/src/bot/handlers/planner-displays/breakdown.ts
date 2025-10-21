import { currency } from "@skyhelperbot/constants";
import type { IBreakdownInstanceCost } from "@skyhelperbot/constants/skygame-planner";

/**
 * Format a cost breakdown instance into display components
 */
export function formatBreakdownCost(cost: IBreakdownInstanceCost) {
  const parts: string[] = [];

  // Currency summary
  const currencySummary: string[] = [];
  if (cost.cost.c) currencySummary.push(`${cost.cost.c} <:Candle:${currency.c}>`);
  if (cost.cost.h) currencySummary.push(`${cost.cost.h} <:Heart:${currency.h}>`);
  if (cost.cost.ac) currencySummary.push(`${cost.cost.ac} <:AC:${currency.ac}>`);
  if (cost.cost.ec) currencySummary.push(`${cost.cost.ec} <:EventTicket:${currency.ec}>`);
  if (cost.cost.sc) currencySummary.push(`${cost.cost.sc} <:SeasonCandle:${currency.sc}>`);
  if (cost.cost.sh) currencySummary.push(`${cost.cost.sh} <:SeasonHeart:${currency.sh}>`);

  if (currencySummary.length > 0) {
    parts.push(`**Total:** ${currencySummary.join(" ")}`);
  }

  if (cost.price > 0) {
    parts.push(`**USD Spent:** $${cost.price.toFixed(2)}`);
  }

  // Item counts
  const itemCounts: string[] = [];
  if (cost.nodes.length > 0) {
    itemCounts.push(`${cost.nodes.length} spirit tree nodes`);
  }
  if (cost.listNodes.length > 0) {
    itemCounts.push(`${cost.listNodes.length} shop items`);
  }
  if (cost.iaps.length > 0) {
    itemCounts.push(`${cost.iaps.length} IAPs`);
  }

  if (itemCounts.length > 0) {
    parts.push(`**Items:** ${itemCounts.join(", ")}`);
  }

  return parts.join("\n");
}

/**
 * Format detailed breakdown of items
 */
export function formatDetailedBreakdown(cost: IBreakdownInstanceCost, maxItems = 10) {
  const items: string[] = [];

  // Spirit tree nodes
  const nodeItems = cost.nodes.filter((n) => n.item && (n.c ?? n.h ?? n.ac ?? n.ec ?? n.sc ?? n.sh)).slice(0, maxItems);

  for (const node of nodeItems) {
    const costParts: string[] = [];
    if (node.c) costParts.push(`${node.c}c`);
    if (node.h) costParts.push(`${node.h}h`);
    if (node.ac) costParts.push(`${node.ac}ac`);
    if (node.ec) costParts.push(`${node.ec}ec`);
    if (node.sc) costParts.push(`${node.sc}sc`);
    if (node.sh) costParts.push(`${node.sh}sh`);

    if (costParts.length > 0 && node.item) {
      items.push(`- ${node.item.name} (${costParts.join(", ")})`);
    }
  }

  // Shop items
  const shopItems = cost.listNodes.slice(0, Math.max(0, maxItems - nodeItems.length));
  for (const listNode of shopItems) {
    const costParts: string[] = [];
    if (listNode.c) costParts.push(`${listNode.c}c`);
    if (listNode.h) costParts.push(`${listNode.h}h`);
    if (listNode.ac) costParts.push(`${listNode.ac}ac`);
    if (listNode.ec) costParts.push(`${listNode.ec}ec`);
    if (listNode.sc) costParts.push(`${listNode.sc}sc`);
    if (listNode.sh) costParts.push(`${listNode.sh}sh`);

    if (costParts.length > 0) {
      const quantity = listNode.quantity ? ` x${listNode.quantity}` : "";
      items.push(`- ${listNode.item.name}${quantity} (${costParts.join(", ")})`);
    }
  }

  // IAPs
  for (const iap of cost.iaps.slice(0, Math.max(0, maxItems - nodeItems.length - shopItems.length))) {
    if (iap.price) {
      items.push(`- ${iap.name} ($${iap.price.toFixed(2)})`);
    }
  }

  const totalItems = cost.nodes.length + cost.listNodes.length + cost.iaps.length;
  if (totalItems > maxItems) {
    items.push(`-# ... and ${totalItems - maxItems} more items`);
  }

  return items.length > 0 ? items.join("\n") : "No items";
}
