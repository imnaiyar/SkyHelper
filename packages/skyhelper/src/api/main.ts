import { APP_FILTER, APP_GUARD, NestFactory } from "@nestjs/core";
import config from "@/config";
import logger from "@/handlers/logger";
import { SkyHelper } from "@/structures";
import { type MiddlewareConsumer, Module, type NestModule } from "@nestjs/common";
import { AppController } from "./controllers/app.controller.js";
import { GuildController } from "./controllers/guild.controller.js";
import { AuthMiddleware } from "./middlewares/auth.middleware.js";
import { BotController } from "./controllers/bot.controller.js";
import { UpdateController } from "./controllers/update.controller.js";
import { UsersController } from "./controllers/user.controller.js";
import { GuildMiddleware } from "./middlewares/guild.middleware.js";
import { UpdateMiddleware } from "./middlewares/update.middleware.js";
import { WebhookEventMiddleware } from "./middlewares/discord-webhook.middleware.js";
import { WebhookEventController } from "./controllers/discord-webhooks.controller.js";
import * as _express from "express";
import { Logger } from "./logger.service.js";
import { SentryModule, SentryGlobalFilter } from "@sentry/nestjs/setup";
import { setupSwagger } from "./swagger.config.js";
import { ThrottlerModule } from "@nestjs/throttler";
import { CustomThrottlerGuard } from "./guards/throttler.guard.js";

export async function bootstrap(client: SkyHelper) {
  @Module({
    imports: [
      SentryModule.forRoot(),
      ThrottlerModule.forRoot([
        {
          ttl: 60000, // 60 seconds
          limit: 100, // 100 requests per minute
        },
      ]),
    ],
    controllers: [AppController, GuildController, BotController, UpdateController, UsersController, WebhookEventController],
    providers: [
      { provide: APP_FILTER, useValue: SentryGlobalFilter },
      { provide: APP_GUARD, useClass: CustomThrottlerGuard },
      { provide: "BotClient", useValue: client },
    ],
  })
  class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
      consumer.apply(AuthMiddleware).forRoutes("guilds", "update", "users");
      consumer.apply(GuildMiddleware).forRoutes("guilds");
      consumer.apply(UpdateMiddleware).forRoutes("update");
      consumer.apply(WebhookEventMiddleware).forRoutes("webhook-event");
    }
  }

  const app = await NestFactory.create(AppModule, {
    logger: new Logger(),
  });

  // Set up Swagger documentation if in development mode
  if (process.env.NODE_ENV === "development" || process.env.ENABLE_SWAGGER === "true") {
    setupSwagger(app);
    logger.custom("Swagger UI available at /api/docs", "SWAGGER");
  }

  app.enableCors({
    credentials: true,
    maxAge: 40,
    origin: config.DASHBOARD.WEB_URL,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "HEAD", "POST", "DELETE", "PATCH"],
  });

  await app.listen(config.DASHBOARD.port || 8080, () => {
    logger.custom("Dashboard started at port " + config.DASHBOARD.port, "DASHBOARD");
  });
}
