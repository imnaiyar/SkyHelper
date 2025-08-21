import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { INestApplication } from "@nestjs/common";
import { writeFileSync } from "fs";
import { join } from "path";

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle("SkyHelper API")
    .setDescription(
      `
      The SkyHelper Bot API provides comprehensive access to Sky: Children of the Light game data and bot management features.
      
      ## Features
      - **Guild Management**: Configure bot settings for Discord servers
      - **Game Data**: Access shards, events, traveling spirits, and daily quests information
      - **User Preferences**: Manage user settings and linked roles
      - **Live Updates**: Configure automated updates for game events
      - **Reminders**: Set up notifications for game activities
      
      ## Authentication
      Most endpoints require authentication via Bearer token obtained through Discord OAuth2.
      The token should be included in the Authorization header as: \`Bearer <token>\`
      
      ## Rate Limiting
      API requests are rate-limited to prevent abuse. Please respect the limits and implement proper retry logic.
      
      ## Support
      For API support, join our Discord server or check the GitHub repository.
    `,
    )
    .setVersion("7.7.0")
    .setContact("SkyHelper Team", "https://github.com/imnaiyar/SkyHelper", "support@skyhelperbot.com")
    .setLicense("MIT", "https://github.com/imnaiyar/SkyHelper/blob/main/LICENSE")
    .addServer("https://api.skyhelperbot.com", "Production API")
    .addServer("http://localhost:8080", "Development API")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Authorization",
        description: "Enter your Discord OAuth2 access token",
        in: "header",
      },
      "bearer",
    )
    .addTag("Application", "General application endpoints and health checks")
    .addTag("Bot Statistics", "Bot performance and statistics endpoints")
    .addTag("Guild Management", "Discord server/guild configuration and management")
    .addTag("User Management", "User settings and profile management")
    .addTag("Game Data Updates", "Sky: Children of the Light game data management")
    .addTag("Discord Webhooks", "Internal Discord webhook handlers")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: "none",
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: "SkyHelper API Documentation",
    customfavIcon: "https://skyhelperbot.com/favicon.ico",
    customCssUrl: "https://skyhelperbot.com/swagger-ui.css",
  });

  return document;
}

export function generateOpenApiSpec(app: INestApplication, outputPath?: string) {
  const document = setupSwagger(app);
  const path = outputPath || join(process.cwd(), "openapi.json");

  writeFileSync(path, JSON.stringify(document, null, 2));
  console.log(`OpenAPI specification generated at: ${path}`);

  return document;
}
