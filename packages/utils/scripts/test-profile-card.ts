import { generatePlannerProfileCard } from "../src/classes/PlannerStatsCard.js";
import type { APIUser } from "discord-api-types/v10";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testProfileCard() {
  console.log("Generating profile card with mocked data...");

  // Mock user data
  const mockUser: APIUser = {
    id: "1242195710644977915",
    username: "SkyExplorer",
    global_name: "Sky Explorer ✨",
    discriminator: "0",
    avatar: "bacbd746b4a679bbc4489037b3eb2d7d", // Sample avatar hash
    bot: false,
    system: false,
    mfa_enabled: false,
    locale: "en-US",
    verified: true,
    email: null,
  };

  // Mock progress data with different percentages to see visual variation
  const mockProgress = {
    items: {
      total: 1000,
      unlocked: 750,
      percentage: 75,
    },
    nodes: {
      total: 500,
      unlocked: 300,
      percentage: 60,
    },
    wingedLights: {
      total: 200,
      unlocked: 180,
      percentage: 90,
    },
    iaps: {
      total: 50,
      unlocked: 10,
      bought: 10,
      percentage: 20,
    },
  };

  // Mock currencies data
  const mockCurrencies = {
    candles: 1234,
    hearts: 89,
    ascendedCandles: 45,
    giftPasses: 12,
  };

  try {
    const buffer = await generatePlannerProfileCard({
      user: mockUser,
      progress: mockProgress,
      currencies: mockCurrencies,
      botName: "SkyHelper",
      // You can optionally add a bot icon URL here:
      // botIcon: "https://cdn.discordapp.com/avatars/bot_id/bot_avatar.png",
    });

    // Save the output
    const outputPath = path.join(__dirname, "../test-output");
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    const filename = path.join(outputPath, `profile-card-${Date.now()}.png`);
    fs.writeFileSync(filename, buffer);

    console.log(`✅ Profile card generated successfully!`);
    console.log(`📁 Saved to: ${filename}`);
    console.log(`\nProgress Summary:`);
    console.log(`  Items: ${mockProgress.items.unlocked}/${mockProgress.items.total} (${mockProgress.items.percentage}%)`);
    console.log(`  Nodes: ${mockProgress.nodes.unlocked}/${mockProgress.nodes.total} (${mockProgress.nodes.percentage}%)`);
    console.log(
      `  Winged Lights: ${mockProgress.wingedLights.unlocked}/${mockProgress.wingedLights.total} (${mockProgress.wingedLights.percentage}%)`,
    );
    console.log(`  IAPs: ${mockProgress.iaps.bought}/${mockProgress.iaps.total} (${mockProgress.iaps.percentage}%)`);
    console.log(`\nCurrencies:`);
    console.log(`  Candles: ${mockCurrencies.candles}`);
    console.log(`  Hearts: ${mockCurrencies.hearts}`);
    console.log(`  Ascended Candles: ${mockCurrencies.ascendedCandles}`);
    console.log(`  Gift Passes: ${mockCurrencies.giftPasses}`);
  } catch (error) {
    console.error("❌ Error generating profile card:", error);
    process.exit(1);
  }
}

// Test with different scenarios if argument is provided
const scenario = process.argv[2];

if (scenario === "beginner") {
  console.log("Testing with beginner progress...");
  await testProfileCard();
} else if (scenario === "advanced") {
  console.log("Testing with advanced progress...");
  // You can modify the mockProgress values here for different scenarios
  await testProfileCard();
} else if (scenario === "complete") {
  console.log("Testing with 100% completion...");
  // You can modify for 100% completion
  await testProfileCard();
} else {
  await testProfileCard();
}
