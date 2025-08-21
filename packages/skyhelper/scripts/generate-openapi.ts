#!/usr/bin/env node

/**
 * Script to generate OpenAPI specification file
 * This script creates a standalone OpenAPI spec without starting the server
 */

import { NestFactory } from "@nestjs/core";
import { Module } from "@nestjs/common";
import { AppController } from "../src/api/controllers/app.controller.js";
import { GuildController } from "../src/api/controllers/guild.controller.js";
import { BotController } from "../src/api/controllers/bot.controller.js";
import { UpdateController } from "../src/api/controllers/update.controller.js";
import { UsersController } from "../src/api/controllers/user.controller.js";
import { WebhookEventController } from "../src/api/controllers/discord-webhooks.controller.js";
import { generateOpenApiSpec } from "../src/api/swagger.config.js";
import { Logger } from "../src/api/logger.service.js";
import { join } from "node:path";

// Mock bot client for OpenAPI generation
const mockBotClient = {
  guilds: new Map(),
  user: { id: "123456789012345678" },
  ping: 50,
  applicationCommands: new Map(),
  spiritsData: {},
  api: {
    applications: {
      getCurrent: () => Promise.resolve({ approximate_user_install_count: 1000 }),
    },
  },
  schemas: {
    getTS: () => Promise.resolve({ value: "test", visitDate: "01-01-2024", index: 1 }),
    getEvent: () => Promise.resolve({ name: "Test Event", startDate: "01-01-2024", endDate: "31-01-2024" }),
    getDailyQuests: () => Promise.resolve({ quests: [], last_updated: "", rotating_candles: {}, seasonal_candles: {} }),
    getUser: () => Promise.resolve({ language: { value: "en-US" }, linkedRole: {} }),
    getSettings: () => Promise.resolve({ prefix: "!", language: { value: "en-US" }, beta: false }),
  },
  utils: {
    parseEmoji: () => ({ id: "123456789012345678" }),
    getUserAvatar: () => "https://example.com/avatar.png",
    parseWebhookURL: () => ({ id: "123", token: "token" }),
  },
  rest: {
    cdn: {
      emoji: () => "https://example.com/emoji.png",
      avatar: () => "https://example.com/avatar.png",
      defaultAvatar: () => "https://example.com/default.png",
      banner: () => "https://example.com/banner.png",
    },
  },
  config: {
    Support: "https://discord.gg/skyhelper",
  },
};

@Module({
  controllers: [AppController, BotController, UpdateController, UsersController, WebhookEventController, GuildController],
  providers: [{ provide: "BotClient", useValue: mockBotClient }],
})
class OpenApiModule {}

async function generateSpec() {
  console.log("Generating OpenAPI specification...");

  try {
    const app = await NestFactory.create(OpenApiModule, {
      logger: new Logger(),
    });

    // Get output path from command line args or use default
    const outputPath = process.argv[2] || join(process.cwd(), "./openapi.json");
    generateOpenApiSpec(app, outputPath);

    await app.close();
    console.log("✅ OpenAPI specification generated successfully!");
  } catch (error) {
    console.error("❌ Failed to generate OpenAPI specification:", error);
    process.exit(1);
  }
}

// Run the script
generateSpec();
