import { createCanvas, type SKRSContext2D } from "@napi-rs/canvas";
import type { ISpiritTree, INode } from "skygame-data";
import {
  preloadNodeTreeImages,
  drawItem,
  drawConnector,
  drawBackground,
  drawSpiritText,
  type GenerateSpiritTreeOptions,
} from "./SpiritTreeShared.js";
import { PlannerService } from "@/planner";
import { drawBotTitleHeader } from "./shared.js";

// --------------------
// #region Recursive renderer
// --------------------
async function renderNodeRecursive(
  ctx: SKRSContext2D,
  node: INode,
  x: number,
  y: number,
  spacingY: number,
  size: number,
  season: boolean,
  highlightItems?: string[],
  noOpacity = false,
  visited = new Set<string>(),
) {
  if (visited.has(node.guid)) return;
  visited.add(node.guid);
  const gap = Math.max(10, size * 0.7);

  await drawItem(ctx, x, y, size, node, season, highlightItems, noOpacity);

  if (node.n) {
    const ny = y + spacingY;
    drawConnector(ctx, x, y, x, ny, size / 2, gap);
    await renderNodeRecursive(ctx, node.n, x, ny, spacingY, size, season, highlightItems, noOpacity, visited);
  }

  if (node.nw) {
    const bx = x + spacingY - 20;
    const by = y + spacingY / 1.5;
    drawConnector(ctx, x, y, bx, by, size / 2, gap);
    await renderNodeRecursive(ctx, node.nw, bx, by, spacingY, size, season, highlightItems, noOpacity, visited);
  }

  if (node.ne) {
    const bx = x - spacingY + 20;
    const by = y + spacingY / 1.5;
    drawConnector(ctx, x, y, bx, by, size / 2, gap);
    await renderNodeRecursive(ctx, node.ne, bx, by, spacingY, size, season, highlightItems, noOpacity, visited);
  }
}

// --------------------
// #region Main generator
// --------------------
/**
 * Generates a spirit tree image as a Buffer.
 *
 * @param tree The spirit tree data to render.
 * @param options rendering options.
 * @returns A promise that resolves to a PNG image buffer of the rendered spirit tree.
 *
 * @example
 * import { generateSpiritTree } from './SpiritTreeRenderer';
 * import type { ISpiritTree } from '@skyhelperbot/constants/skygame-planner';
 *
 * const tree: ISpiritTree = getSpiritTreeData();
 * const buffer = await generateSpiritTree(tree, {
 *   season: true,
 *   spiritName: "Grateful Spirit",
 *   spiritSubtitle: "Season of Gratitude",
 *   highlightItems: ["item1", "item2"],
 *   scale: 1
 * });
 */
export async function generateSpiritTree(
  tree: ISpiritTree & { node: INode },
  options: GenerateSpiritTreeOptions = {},
): Promise<Buffer> {
  const scale = options.scale ?? 0.5; // default slightly reduced for perf
  const baseSize = 64 * scale;
  // count center nodes following the `.n` link from root
  const countCenterNodes = (root?: INode) => {
    if (!root) return 0;
    const seen = new Set<string>();
    let cur: INode | undefined = root;
    let count = 0;
    while (cur && !seen.has(cur.guid)) {
      seen.add(cur.guid);
      count++;
      cur = cur.n;
    }
    return count;
  };

  const centerCount = countCenterNodes(tree.node);
  // if there are up to 3 center nodes, make the node size twice as large
  const size = centerCount > 0 && centerCount <= 3 ? baseSize * 2 : baseSize;
  const spacingY = size * 4;
  const spirit = PlannerService.getTreeSpirit(tree);

  // preload all images in parallel
  await preloadNodeTreeImages(tree);

  // #region BFS to estimate dimensions
  const queue: Array<{ node: INode; x: number; y: number; depth: number }> = [];
  const visited = new Set<string>();
  queue.push({ node: tree.node, x: 0, y: 0, depth: 0 });
  let minX = 0,
    maxX = 0,
    maxDepth = 0;

  while (queue.length) {
    const cur = queue.shift()!;
    if (visited.has(cur.node.guid)) continue;
    visited.add(cur.node.guid);
    maxDepth = Math.max(maxDepth, cur.depth);
    minX = Math.min(minX, cur.x);
    maxX = Math.max(maxX, cur.x);

    if (cur.node.n) queue.push({ node: cur.node.n, x: cur.x, y: cur.y + 1, depth: cur.depth + 1 });
    if (cur.node.nw) queue.push({ node: cur.node.nw, x: cur.x - 1, y: cur.y + 1, depth: cur.depth + 1 });
    if (cur.node.ne) queue.push({ node: cur.node.ne, x: cur.x + 1, y: cur.y + 1, depth: cur.depth + 1 });
  }

  const columns = maxX - minX + 1;
  const width = Math.max(800, Math.ceil(columns * (size * 4) * 1.5));
  const height = Math.max(800, Math.ceil((maxDepth + 1) * spacingY + size * 3));

  const canvas = createCanvas(width, height);
  const ctx: SKRSContext2D = canvas.getContext("2d");

  // Draw background and watermark
  await drawBackground(ctx, width, height, spirit?.imageUrl ?? options.spiritUrl);

  await drawBotTitleHeader({
    ctx,
    botName: options.botName ?? "SkyHelper",
    botIcon: options.botIcon,
    size: Math.max(18, Math.floor(Math.min(width, height) / 30)),
  });

  const centerX = Math.floor(width / 2);
  // compute the ideal content height for the tree (all depths stacked)
  const contentHeight = Math.ceil((maxDepth + 1) * spacingY + size * 1.5);
  const top = Math.floor((height - contentHeight) / 2);
  const startY = top + contentHeight - size;

  // Draw spirit name and subtitle
  const spiritName = options.spiritName ?? tree.name ?? spirit?.name;
  drawSpiritText(ctx, centerX, startY, size, spiritName, options.spiritSubtitle);

  // Render the tree
  await renderNodeRecursive(
    ctx,
    tree.node,
    centerX,
    startY - size * 2.5,
    -spacingY,
    size,
    !!options.season,
    options.highlightItems,
    options.noOpacity,
  );

  return canvas.toBuffer("image/png");
}
