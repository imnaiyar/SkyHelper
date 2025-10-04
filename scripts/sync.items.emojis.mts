#!/usr/bin/env tsx

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import core from "@actions/core";
import * as jsonc from "jsonc-parser";
const APP_ID = process.env.APP_ID;
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!APP_ID || !BOT_TOKEN) throw new Error("Missing required variables: APP_ID and BOT_TOKEN");
const EMOJI_MAPPINGS_PATH = "packages/constants/emoji_hashes.json";
interface Item {
  id: number;
  icon?: string;
  [key: string]: any;
}

interface ItemsData {
  items: Item[];
}

interface Emoji {
  id: string;
  name: string;
  [key: string]: any;
}

interface EmojiResponse {
  items: Emoji[];
}

interface EmojiMapping extends Record<string, string> {}

const data = await fetch("https://sky-planner.com/assets/data/items.json")
  .then((res) => res.text())
  .then((text) => jsonc.parse(text) as ItemsData);

// Function to convert decimal to base36
function decToBase36(num: number): string {
  return num.toString(36);
}

// Function to generate emoji name
function generateEmojiName(fullName: string): string {
  const maxLength = 32;

  if (fullName.length <= maxLength) {
    let result = fullName;
    // Discord requires minimum 2 characters, append _ if only 1 character
    if (result.length === 1) {
      result += "_";
    }
    return result;
  } else {
    // Generate hash and take first 15 chars, add "h_" prefix
    const hash = crypto.createHash("sha256").update(fullName).digest("hex").substring(0, 15);
    return `h_${hash}`;
  }
}

// Function to fetch existing emojis from Discord API
async function fetchDiscordEmojis(): Promise<Record<string, Emoji>> {
  console.log("Fetching existing emojis from Discord API...");

  try {
    const response = await fetch(`https://discord.com/api/v10/applications/${APP_ID}/emojis`, {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const d: EmojiResponse = await response.json();

    console.log("✅ Successfully fetched existing emojis from Discord");
    console.log(`Found ${d.items.length} existing emojis`);

    // Convert to map
    const emojiMap: Record<string, Emoji> = {};
    d.items.forEach((emoji) => {
      emojiMap[emoji.name] = emoji;
    });

    return emojiMap;
  } catch (error) {
    console.error("❌ Failed to fetch emojis from Discord:", error);
    throw error;
  }
}

// Function to download image
async function downloadImage(url: string, filePath: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      throw new Error("Downloaded file is empty");
    }

    return true;
  } catch (error) {
    const reason = `Download failed: ${error instanceof Error ? error.message : String(error)}`;
    console.error(`Failed to download ${url}:`, error);

    // Track download failure (we'll get the emoji name from the calling context)
    const emojiName = path.basename(filePath, path.extname(filePath));
    failedUploads.push({
      item: emojiName,
      url: url,
      reason: reason,
    });

    return false;
  }
}

interface FailedUpload {
  item: string;
  url: string;
  reason: string;
}

const failedUploads: FailedUpload[] = [];

async function uploadEmoji(iconUrl: string, emojiName: string, filePath: string): Promise<boolean> {
  console.log(`Uploading emoji: ${emojiName} from ${iconUrl}`);

  try {
    // Read and encode image
    const imageBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();

    let contentType = "image/png";
    switch (ext) {
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      case ".webp":
        contentType = "image/webp";
        break;
    }

    const imageData = `data:${contentType};base64,${imageBuffer.toString("base64")}`;

    const payload = {
      name: emojiName,
      image: imageData,
    };

    const response = await fetch(`https://discord.com/api/v10/applications/${APP_ID}/emojis`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 201) {
      console.log(`✅ Successfully uploaded emoji: ${emojiName}`);
      return true;
    } else if (response.status === 429) {
      const errorData = await response.json().catch(() => ({}));
      const retryAfter = errorData.retry_after ?? 1;
      console.log(`⚠️  Rate limited while uploading emoji: ${emojiName}`);
      console.log(`   Waiting ${retryAfter} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      return await uploadEmoji(iconUrl, emojiName, filePath);
    } else {
      const errorText = await response.text();
      const reason = `HTTP ${response.status}: ${errorText}`;
      console.error(`❌ Failed to upload emoji: ${emojiName}: (${reason})\nURL: `, iconUrl);

      failedUploads.push({
        item: emojiName,
        url: iconUrl,
        reason: reason,
      });

      return false;
    }
  } catch (error) {
    const reason = `Error: ${error instanceof Error ? error.message : String(error)}`;
    console.error(`❌ Error uploading emoji ${emojiName}:`, error, "\nURL: ", iconUrl);

    failedUploads.push({
      item: emojiName,
      url: iconUrl,
      reason: reason,
    });

    return false;
  }
}

// Create temporary directory for downloaded images
const tempDir = fs.mkdtempSync(path.join(process.cwd(), "emoji-temp-"));
console.log(`Using temporary directory: ${tempDir}`);

// Cleanup function
const cleanup = () => {
  console.log("Cleaning up temporary directory...");
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (e) {
    // Ignore cleanup errors
  }
};

process.on("exit", cleanup);
process.on("SIGINT", () => process.exit());
process.on("SIGTERM", () => process.exit());

// Load existing emoji names
let existingEmojis: Record<string, Emoji> = {};

try {
  existingEmojis = await fetchDiscordEmojis();
} catch (error) {
  console.error("Failed to fetch emojis from Discord. Exiting...");
  process.exit(1);
}

console.log("");
console.log("Processing items.json...");

// Load and parse items.json
const itemsData: ItemsData = data;

// Group items by icon URL
const iconGroups: Record<string, string> = {};

itemsData.items.forEach((item) => {
  if (!item.icon) return;

  let iconUrl = item.icon;

  // Fix icon URL if it starts with /assets
  if (iconUrl.startsWith("/assets")) {
    iconUrl = `https://sky-planner.com${iconUrl}`;
  }

  const idBase36 = decToBase36(item.id);

  if (iconGroups[iconUrl]) {
    iconGroups[iconUrl] += `_${idBase36}`;
  } else {
    iconGroups[iconUrl] = idBase36;
  }
});

// Load existing emoji mapping and build reverse mapping
let existingMapping: EmojiMapping = {};
const iconUrlToExistingHash: Record<string, string> = {};

if (fs.existsSync(EMOJI_MAPPINGS_PATH)) {
  const mappingContent = fs.readFileSync(EMOJI_MAPPINGS_PATH, "utf8");
  existingMapping = jsonc.parse(mappingContent) ?? {};

  // Build reverse mapping from icon URLs to existing hashes
  const lines = mappingContent.split("\n");
  let currentIconUrl = "";

  for (const line of lines) {
    const iconMatch = /\/\/ Icon: (.+)/.exec(line);
    if (iconMatch) {
      currentIconUrl = iconMatch[1]!.trim();
    }

    const hashMatch = /"(h_[^"]+)":/.exec(line);
    if (hashMatch && currentIconUrl) {
      iconUrlToExistingHash[currentIconUrl] = hashMatch[1]!;
      currentIconUrl = "";
    }
  }
}

// Generate final emoji names and mapping
const finalEmojiNames: Record<string, string> = {};
const hashedToIconUrl: Record<string, string> = {};
const iconUrlToItems: Record<string, string> = {};
const itemsNeedingSync: Record<string, string> = {};
const emojiMapping: EmojiMapping = {};
let totalHashed = 0;

for (const [iconUrl, originalName] of Object.entries(iconGroups)) {
  iconUrlToItems[iconUrl] = originalName;

  // Check if this icon URL already has an existing hashed emoji
  const existingHash = iconUrlToExistingHash[iconUrl];

  if (existingHash) {
    // This icon URL already has a hash - reuse it and merge items
    const finalName = existingHash;
    console.log(`🔄 Reusing existing hash for icon: ${iconUrl}`);
    console.log(`   Hash: ${existingHash}`);

    // Load existing items and merge with new ones
    const existingItems = existingMapping[existingHash] ?? "";
    if (existingItems) {
      // Merge items, removing duplicates
      const existingItemsArray = existingItems.split("_");
      const newItemsArray = originalName.split("_");
      const combinedItems = [...new Set([...existingItemsArray, ...newItemsArray])].sort().join("_");
      emojiMapping[existingHash] = combinedItems;
      itemsNeedingSync[existingHash] = combinedItems;
    } else {
      emojiMapping[existingHash] = originalName;
    }

    hashedToIconUrl[existingHash] = iconUrl;
    finalEmojiNames[iconUrl] = finalName;
  } else {
    // Generate new emoji name
    const finalName = generateEmojiName(originalName);

    // If name was hashed, store mapping
    if (finalName.startsWith("h_")) {
      emojiMapping[finalName] = originalName;
      hashedToIconUrl[finalName] = iconUrl;
      iconUrlToExistingHash[iconUrl] = finalName; // Remember for future
      totalHashed++;
    }

    finalEmojiNames[iconUrl] = finalName;
  }
}

console.log(`Found ${Object.keys(iconGroups).length} unique icons`);
if (totalHashed > 0) {
  console.log(`Names requiring hash due to length: ${totalHashed}`);

  // Handle sync operations for hashed emojis
  if (Object.keys(itemsNeedingSync).length > 0) {
    console.log("");
    console.log("=== SYNC OPERATIONS ===");
    console.log(`Processing ${Object.keys(itemsNeedingSync).length} emoji(s) that need syncing...`);

    for (const [hashedName, newItems] of Object.entries(itemsNeedingSync)) {
      console.log(`🔄 Syncing emoji: ${hashedName}`);
      const existingItems = existingMapping[hashedName] ?? "";

      if (existingItems) {
        console.log(`   Updating mapping: ${existingItems} -> ${newItems}`);
      } else {
        console.log(`   No existing mapping found, treating as new emoji`);
      }
    }
    console.log("");
  }
}

// Create or update emoji mapping file
console.log("Creating/updating emoji mapping file: emoji_hashes.json");
const mappingLines = ["{"];

const entries = Object.entries(emojiMapping);
entries.forEach(([hashedName, items], index) => {
  const iconUrl = hashedToIconUrl[hashedName];
  mappingLines.push(`  // Icon: ${iconUrl}`);
  const comma = index < entries.length - 1 ? "," : "";
  mappingLines.push(`  "${hashedName}": "${items}"${comma}`);
});

mappingLines.push("}");
fs.writeFileSync(
  EMOJI_MAPPINGS_PATH,
  `// ----------------------------------------------------------------------------------------------- //
// This is mapping of hashes used for emoji name whose name exceeded the 32 char limit, 
// the values are base 36 encoded id of item joined together by "_".
// ----------------------------------------------------------------------------------------------- //+\n` +
    mappingLines.join("\n"),
);

// Download and upload each unique icon
let counter = 0;
const total = Object.keys(iconGroups).length;
let skipped = 0;
let uploaded = 0;

for (const [iconUrl, originalName] of Object.entries(iconGroups)) {
  counter++;
  const emojiName = finalEmojiNames[iconUrl]!;

  // Check if emoji already exists or was synced
  if (existingEmojis[emojiName]) {
    skipped++;
    continue;
  }

  console.log(`[${counter}/${total}] Processing: ${emojiName}`);

  if (emojiName.startsWith("h_")) {
    console.log(`  Original name: ${originalName} (${originalName.length} chars, hashed)`);
  }

  console.log(`  Icon URL: ${iconUrl}`);

  // Check if this emoji was handled during sync (merged items)
  if (itemsNeedingSync[emojiName]) {
    console.log(`  ⏭️  Skipping: Emoji '${emojiName}' was synced (items merged)`);
    skipped++;
    console.log("");
    continue;
  }

  // Extract file extension from URL
  let fileExtension = "png";
  const extensionMatch = /\.(png|jpg|jpeg|gif|webp)(\?|$)/i.exec(iconUrl);
  if (extensionMatch) {
    fileExtension = extensionMatch[1]!.toLowerCase();
  } else {
    console.log("  Warning: Could not determine file extension, assuming PNG");
  }

  // Download the image
  const localFile = path.join(tempDir, `${emojiName}.${fileExtension}`);

  console.log("  Downloading image...");
  if (await downloadImage(iconUrl, localFile)) {
    const stats = fs.statSync(localFile);
    console.log(`  Downloaded successfully: ${(stats.size / 1024).toFixed(2)} KB`);

    // Upload to Discord
    if (await uploadEmoji(iconUrl, emojiName, localFile)) {
      uploaded++;
    }
  } else {
    console.log(`  ❌ Failed to download image from ${iconUrl}`);
  }

  console.log("");

  // Add a small delay to avoid hitting rate limits too hard
  await new Promise((resolve) => setTimeout(resolve, 500));
}

console.log("");
console.log("=== SYNC/UPLOAD SUMMARY ===");
console.log(`Total emojis processed: ${total}`);
console.log(`Skipped (already exist): ${skipped}`);
console.log(`Successfully uploaded: ${uploaded}`);
console.log(`Failed uploads: ${failedUploads.length}`);

console.log("");
console.log("=== SYNC OPERATIONS ===");
if (Object.keys(itemsNeedingSync).length > 0) {
  console.log(`Emojis with merged items: ${Object.keys(itemsNeedingSync).length}`);
}

// Output failed uploads
if (failedUploads.length > 0) {
  console.log("");
  console.log("=== FAILED UPLOADS ===");
  failedUploads.forEach((failure, index) => {
    console.log(`${index + 1}. Item: ${failure.item}`);
    console.log(`   URL: ${failure.url}`);
    console.log(`   Reason: ${failure.reason}`);
    console.log("");
  });

  // Create a summary for core.setFailed
  const failureSummary = failedUploads
    .map((failure, index) => `${index + 1}. ${failure.item} (${failure.url}): ${failure.reason}`)
    .join("\n");

  const errorMessage = `Failed to upload ${failedUploads.length} emoji(s):\n${failureSummary}`;

  console.log("Setting workflow as failed due to upload failures...");
  core.setFailed(errorMessage);
} else {
  console.log("");
  console.log("✅ All uploads completed successfully!");
}

console.log("");
console.log("Sync process completed!");
console.log("Temporary files cleaned up.");
