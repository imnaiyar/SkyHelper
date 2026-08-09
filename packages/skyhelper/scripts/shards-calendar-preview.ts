#!/usr/bin/env tsx
/**
 * Shards Calendar Preview Script
 *
 * Renders a monthly shard calendar image to a PNG file for previewing, using
 * the same `@napi-rs/canvas` generator the bot will use.
 *
 * Usage:
 *   pnpm exec scripts/shards-calendar-preview.ts [--month=6] [--year=2026] [--scale=1] [--output=file.png]
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { generateShardsCalendarCard } from "../src/bot/utils/image-generators/ShardsCalendarCard.js";

interface ScriptOptions {
  month?: number;
  year?: number;
  scale: number;
  output: string;
}

/** Parse command line arguments (--key=value only) */
function parseArgs(): ScriptOptions {
  const args = process.argv.slice(2);
  const options: ScriptOptions = { scale: 1, output: "shards-calendar-preview.png" };

  for (const arg of args) {
    if (arg.startsWith("--month=")) {
      options.month = Number(arg.slice("--month=".length));
    } else if (arg.startsWith("--year=")) {
      options.year = Number(arg.slice("--year=".length));
    } else if (arg.startsWith("--scale=")) {
      options.scale = Number(arg.slice("--scale=".length));
    } else if (arg.startsWith("--output=")) {
      options.output = arg.slice("--output=".length);
    } else {
      console.error(`Unknown argument: ${arg}`);
      console.error("Usage: pnpm shards-calendar-preview [--month=6] [--year=2026] [--scale=1] [--output=file.png]");
      process.exit(1);
    }
  }

  if (!Number.isFinite(options.scale) || options.scale <= 0) {
    console.error(`❌ Invalid scale: ${options.scale} (must be a positive number)`);
    process.exit(1);
  }

  return options;
}

async function main() {
  try {
    const options = parseArgs();
    if (options.month !== undefined && (options.month < 1 || options.month > 12)) {
      console.error(`❌ Invalid month: ${options.month} (must be 1-12)`);
      process.exit(1);
    }

    const dateLabel = options.month && options.year ? `${options.month}/${options.year}` : "current month";
    console.log(`📅 Rendering shards calendar for ${dateLabel}...`);
    console.time("Render time");

    const buffer = await generateShardsCalendarCard({
      month: options.month,
      year: options.year,
      scale: options.scale,
    });

    console.timeEnd("Render time");

    const outputPath = resolve(process.cwd(), options.output);
    writeFileSync(outputPath, buffer);

    // PNG dimensions live in the IHDR chunk: width @ offset 16, height @ offset 20
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);

    console.log(`✅ Calendar rendered successfully!`);
    console.log(`📁 Output saved to: ${outputPath}`);
    console.log(`📐 Dimensions: ${width}x${height}`);
    console.log(`📏 File size: ${(buffer.length / 1024).toFixed(1)} KB`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

await main();
