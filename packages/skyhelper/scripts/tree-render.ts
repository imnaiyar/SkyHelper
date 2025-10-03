#!/usr/bin/env tsx
/**
 * Spirit Tree Renderer Script
 *
 * This script takes a spirit name or ID and generates a visual representation of its spirit tree
 * using napi-rs/canvas. The resulting image is saved as a PNG file.
 *
 * Usage:
 *   pnpm tree-render <spiritName> [--season] [--output=filename.png]
 *
 * Examples:
 *   pnpm tree-render "Stretching Guru"
 *   pnpm tree-render "lumberjack" --season --output=forest_spirit.png
 */

import { SkyPlannerData } from "@skyhelperbot/constants";
import { generateSpiritTree } from "@skyhelperbot/utils";
import { writeFileSync } from "fs";
import { resolve } from "path";

interface ScriptOptions {
  spiritQuery: string;
  season: boolean;
  output: string;
  spiritName?: string;
}

/**
 * Parse command line arguments
 */
function parseArgs(): ScriptOptions {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: pnpm tree-render <spiritName> [--season] [--output=filename.png] [--name=spirit-name]");
    process.exit(1);
  }

  let spiritQuery = "";
  let season = false;
  let output = "";
  let spiritName;

  for (const arg of args) {
    if (arg === "--season") {
      season = true;
    } else if (arg.startsWith("--output=")) {
      output = arg.substring(9);
    } else if (arg.startsWith("--name=")) {
      spiritName = arg.substring(7);
    } else if (!arg.startsWith("--")) {
      spiritQuery = arg;
    }
  }

  if (!spiritQuery) {
    console.error("Error: Spirit name is required");
    process.exit(1);
  }

  if (!output) {
    // Generate default filename from spirit name
    const sanitized = spiritQuery.toLowerCase().replace(/[^a-z0-9]/g, "_");
    output = `${sanitized}_tree.png`;
  }

  return { spiritQuery, season, output, spiritName };
}

/**
 * Find a spirit by name or ID in the planner data
 */
function findSpirit(data: SkyPlannerData.TransformedData, query: string): SkyPlannerData.ISpirit | null {
  // First try exact GUID match
  const spiritByGuid = data.spirits.find((spirit) => spirit.guid === query);
  if (spiritByGuid) return spiritByGuid;

  // Then try exact name match (case insensitive)
  const spiritByName = data.spirits.find((spirit) => spirit.name.toLowerCase().includes(query.toLowerCase()));
  if (spiritByName) return spiritByName;

  // Finally try partial name match
  const spiritByPartialName = data.spirits.find((spirit) => spirit.name.toLowerCase().includes(query.toLowerCase()));
  if (spiritByPartialName) return spiritByPartialName;

  return null;
}

/**
 * List available spirits
 */
function listSpirits(data: SkyPlannerData.TransformedData, limit = 20) {
  console.log("\nAvailable spirits (showing first", limit, "):");
  console.log("==========================================");

  const spirits = data.spirits.slice(0, limit);
  for (const spirit of spirits) {
    const type =
      spirit.type === SkyPlannerData.SpiritType.Regular
        ? "Regular"
        : spirit.type === SkyPlannerData.SpiritType.Season
          ? "Seasonal"
          : spirit.type === SkyPlannerData.SpiritType.Elder
            ? "Elder"
            : "Guide";
    const area = spirit.area ? ` (${spirit.area.realm.name})` : "";
    console.log(`  • ${spirit.name}${area} [${type}]`);
  }

  if (data.spirits.length > limit) {
    console.log(`  ... and ${data.spirits.length - limit} more spirits`);
  }
}

/**
 * Main script execution
 */
async function main() {
  try {
    const options = parseArgs();

    console.log("Loading SkyGame Planner data...");
    const data = await SkyPlannerData.getSkyGamePlannerData();

    console.log(`Searching for spirit: "${options.spiritQuery}"`);
    const spirit = findSpirit(data, options.spiritQuery);

    if (!spirit) {
      console.error(`❌ Spirit not found: "${options.spiritQuery}"`);
      listSpirits(data);
      process.exit(1);
    }

    console.log(`✅ Found spirit: ${spirit.name}`);
    const tree = spirit.tree ?? spirit.events?.at(-1)?.tree;
    if (!tree) {
      console.error(`❌ Spirit "${spirit.name}" has no tree data available`);
      process.exit(1);
    }

    console.log(`📊 Rendering tree for: ${spirit.name}`);
    console.log(`   Tree has ${countNodes(tree.node)} nodes`);
    console.log(`   Season pass items: ${options.season ? "enabled" : "disabled"}`);

    // Render the tree
    console.time("Render time");
    const imageBuffer = await generateSpiritTree(tree, {
      season: options.season,
      spiritName: options.spiritName,
    });
    console.timeEnd("Render time");

    // Save to file
    const outputPath = resolve(process.cwd(), options.output);
    writeFileSync(outputPath, imageBuffer);

    console.log(`✅ Tree rendered successfully!`);
    console.log(`📁 Output saved to: ${outputPath}`);
    console.log(`📏 File size: ${(imageBuffer.length / 1024).toFixed(1)} KB`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

/**
 * Count nodes in a tree (for statistics)
 */
function countNodes(node: SkyPlannerData.INode, visited = new Set<string>()): number {
  if (visited.has(node.guid)) return 0;
  visited.add(node.guid);

  let count = 1;

  if (node.nw) count += countNodes(node.nw, visited);
  if (node.n) count += countNodes(node.n, visited);
  if (node.ne) count += countNodes(node.ne, visited);

  return count;
}

// Run the script
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
