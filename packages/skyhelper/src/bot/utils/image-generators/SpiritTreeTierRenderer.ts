import { createCanvas, type SKRSContext2D } from "@napi-rs/canvas";
import { type ISpiritTree, type ISpiritTreeTier, type INode, SpiritTreeHelper } from "skygame-data";
import {
  preloadTierTreeImages,
  drawItem,
  drawLine,
  drawBackground,
  drawWatermarkAndOverlay,
  drawSpiritText,
  type GenerateSpiritTreeOptions,
} from "./SpiritTreeShared.js";
import { PlannerService } from "@/planner";

// --------------------
// #region Tier Tree Renderer
// --------------------
interface TierLayout {
  tiers: Array<{
    rows: Array<{
      nodes: Array<{ node: INode | null; x: number; y: number }>;
      y: number;
    }>;
    separatorY: number;
  }>;
  totalHeight: number;
}

function calculateTierLayout(tree: ISpiritTree, size: number, rowSpacing: number, tierSpacing: number): TierLayout {
  const tiers: TierLayout["tiers"] = [];
  let currentY = 0;

  const allTiers = SpiritTreeHelper.getTiers(tree);
  for (const tier of allTiers) {
    const tierData: TierLayout["tiers"][0] = {
      rows: [],
      separatorY: 0,
    };

    // Process rows from bottom to top (reverse order for rendering)
    for (const row of tier.rows) {
      const rowData: (typeof tierData.rows)[0] = {
        nodes: [],
        y: currentY,
      };

      // Calculate node positions: left (index 0), center (index 1), right (index 2)
      const nodeSpacing = size * 4;
      const positions = [
        -nodeSpacing, // left
        0, // center
        nodeSpacing, // right
      ];

      for (let i = 0; i < 3; i++) {
        const node = row[i] ?? null;
        rowData.nodes.push({
          node,
          x: positions[i]!,
          y: currentY,
        });
      }

      tierData.rows.push(rowData);
      currentY += rowSpacing;
    }

    // Add separator space after tier
    tierData.separatorY = currentY;
    currentY += tierSpacing;

    tiers.push(tierData);
  }

  return {
    tiers,
    totalHeight: currentY,
  };
}

async function renderTierTree(
  ctx: SKRSContext2D,
  tree: ISpiritTree,
  centerX: number,
  startY: number,
  size: number,
  season: boolean,
  highlightItems?: string[],
) {
  const rowSpacing = size * 4; // spacing between rows
  const tierSpacing = size * 2; // spacing for separator between tiers
  const layout = calculateTierLayout(tree, size, rowSpacing, tierSpacing);

  // Render from bottom to top (tiers are already in correct order)
  let currentY = startY;

  for (const [index, tier] of layout.tiers.entries()) {
    // Render rows from bottom to top within each tier
    for (const row of tier.rows) {
      for (const { node, x } of row.nodes) {
        if (node) {
          await drawItem(ctx, centerX + x, currentY - 80, size, node, season, highlightItems);
        }
      }
      currentY -= rowSpacing; // Move up for next row
    }

    // Draw separator line above this tier
    if (index < layout.tiers.length - 1) {
      currentY -= tierSpacing / 2;
      const separatorWidth = size * 12;
      drawLine(ctx, centerX - separatorWidth / 2, currentY, centerX + separatorWidth / 2, currentY, 2, "#F6EAE0");
      currentY -= tierSpacing / 2;
    }
  }
}

// --------------------
// #region Main generator
// --------------------
/**
 * Generates a tier-based spirit tree image as a Buffer.
 *
 * @param tree The spirit tree data to render (must have tier structure).
 * @param options rendering options.
 * @returns A promise that resolves to a PNG image buffer of the rendered spirit tree.
 *
 * @example
 * import { generateSpiritTreeTier } from './SpiritTreeTierRenderer';
 * import type { ISpiritTree } from '@skyhelperbot/constants/skygame-planner';
 *
 * const tree: ISpiritTree = getSpiritTreeData();
 * const buffer = await generateSpiritTreeTier(tree, {
 *   season: true,
 *   spiritName: "Grateful Spirit",
 *   spiritSubtitle: "Season of Gratitude",
 *   highlightItems: ["item1", "item2"],
 *   scale: 1
 * });
 */
export async function generateSpiritTreeTier(
  tree: ISpiritTree & { tier: ISpiritTreeTier },
  options: GenerateSpiritTreeOptions = {},
): Promise<Buffer> {
  const scale = options.scale ?? 0.5;
  const baseSize = 64 * scale;

  // Count total rows across all tiers to determine node size
  let totalRows = 0;
  const tiers = SpiritTreeHelper.getTiers(tree);
  tiers.forEach((tier) => (totalRows += tier.rows.length));

  // Adjust node size based on tree complexity
  const size = totalRows <= 5 ? baseSize * 2 : baseSize;
  const rowSpacing = size * 4;
  const tierSpacing = size * 3;

  const spirit = PlannerService.getTreeSpirit(tree);

  // Preload all images in parallel
  await preloadTierTreeImages(tree);

  // Calculate dimensions
  const layout = calculateTierLayout(tree, size, rowSpacing, tierSpacing);
  const width = Math.max(1200, Math.ceil(size * 16));
  const height = Math.max(800, Math.ceil(layout.totalHeight + size * 8));

  const canvas = createCanvas(width, height);
  const ctx: SKRSContext2D = canvas.getContext("2d");

  // Draw background and watermark
  await drawBackground(ctx, width, height, spirit?.imageUrl ?? options.spiritUrl);
  drawWatermarkAndOverlay(ctx, width, height);

  const centerX = Math.floor(width / 2);
  const startY = height - size * 4;

  await renderTierTree(ctx, tree, centerX, startY - 40, size * 1.15, !!options.season, options.highlightItems);

  // Draw spirit name and subtitle at the bottom
  const spiritName = options.spiritName ?? tree.name ?? spirit?.name;
  drawSpiritText(ctx, centerX, startY + size * 1.5, size, spiritName, options.spiritSubtitle);

  return canvas.toBuffer("image/png");
}

export default generateSpiritTreeTier;
