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
import { writeFileSync } from "fs";
import { resolve } from "path";
import { ISpirit, SpiritTreeHelper, type ISkyData } from "skygame-data";
import { SpiritType } from "../src/bot/@types/planner.js";
import { fetchSkyData } from "../src/bot/handlers/planner/index.js";
import { SkyHelper } from "../src/bot/structures/Client.js";
import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import { generateSpiritTree } from "../src/bot/utils/image-generators/SpiritTreeRenderer.js";
import { generateSpiritTreeTier } from "../src/bot/utils/image-generators/SpiritTreeTierRenderer.js";
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
function findSpirit(data: ISkyData, query: string): ISpirit | null {
  // First try exact GUID match
  const spiritByGuid = data.spirits.items.find((spirit) => spirit.guid === query);
  if (spiritByGuid) return spiritByGuid;

  // Then try exact name match (case insensitive)
  const spiritByName = data.spirits.items.find((spirit) => spirit.name.toLowerCase().includes(query.toLowerCase()));
  if (spiritByName) return spiritByName;

  // Finally try partial name match
  const spiritByPartialName = data.spirits.items.find((spirit) => spirit.name.toLowerCase().includes(query.toLowerCase()));
  if (spiritByPartialName) return spiritByPartialName;

  return null;
}

/**
 * List available spirits
 */
function listSpirits(data: ISkyData, limit = 20) {
  console.log("\nAvailable spirits (showing first", limit, "):");
  console.log("==========================================");

  const spirits = data.spirits.items.slice(0, limit);
  for (const spirit of spirits) {
    const type =
      spirit.type === SpiritType.Regular
        ? "Regular"
        : spirit.type === SpiritType.Season
          ? "Seasonal"
          : spirit.type === SpiritType.Elder
            ? "Elder"
            : "Guide";
    const area = spirit.area ? ` (${spirit.area.realm.name})` : "";
    console.log(`  • ${spirit.name}${area} [${type}]`);
  }

  if (data.spirits.items.length > limit) {
    console.log(`  ... and ${data.spirits.items.length - limit} more spirits`);
  }
}

/**
 * Main script execution
 */
async function main() {
  try {
    const options = parseArgs();

    console.log("Loading SkyGame Planner data...");
    // only basic client since we do not need to fully connect and only needed for emojis
    const rest = new REST().setToken(process.env.TOKEN!);
    const gateway = new WebSocketManager({ fetchGatewayInformation: () => "" as any, intents: 1 });
    const client = new SkyHelper({ gateway: gateway, rest });
    const data = await fetchSkyData(client);

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
    const nodes = SpiritTreeHelper.getNodes(tree);
    console.log(`📊 Rendering tree for: ${spirit.name}`);
    console.log(`   Tree has ${nodes.length} nodes`);
    console.log(`   Season pass items: ${options.season ? "enabled" : "disabled"}`);

    // Render the tree
    console.time("Render time");
    const option = {
      season: options.season,
      spiritName: options.spiritName,
      spiritSubtitle: "Travleing Spirit #150",
    };
    // @ts-expect-error i dont need to be robust here
    const imageBuffer = tree.node ? await generateSpiritTree(tree, option) : await generateSpiritTreeTier(tree, option);
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

// Run the script
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
