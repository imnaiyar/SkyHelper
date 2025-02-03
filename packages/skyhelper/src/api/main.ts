import { BaseExceptionFilter, HttpAdapterHost, NestFactory } from "@nestjs/core";
import config from "@/config";
import logger from "@/handlers/logger";
import { SkyHelper } from "@/structures";
import { type MiddlewareConsumer, Module, type NestModule } from "@nestjs/common";
import { AppController } from "./controllers/app.controller.js";
import { GuildController } from "./controllers/guild.controller.js";
import { AuthMiddleware } from "./middlewares/auth.middleware.js";
import { StatsController } from "./controllers/stats.controller.js";
import { UpdateController } from "./controllers/update.controller.js";
import { UsersController } from "./controllers/user.controller.js";
import { GuildMiddleware } from "./middlewares/guild.middleware.js";
import { UpdateMiddleware } from "./middlewares/update.middleware.js";
import { WebhookEventMiddleware } from "./middlewares/discord-webhook.middleware.js";
import { WebhookEventController } from "./controllers/discord-webhooks.controller.js";
import * as _express from "express";
import { Logger } from "./logger.service.js";
import * as Sentry from "@sentry/node";

export async function bootstrap(client: SkyHelper) {
  @Module({
    imports: [],
    controllers: [AppController, GuildController, StatsController, UpdateController, UsersController, WebhookEventController],
    providers: [{ provide: "BotClient", useValue: client }],
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
  app.enableCors({
    credentials: true,
    maxAge: 40,
    origin: config.DASHBOARD.WEB_URL,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "HEAD", "POST", "DELETE", "PATCH"],
  });
  const { httpAdapter } = app.get(HttpAdapterHost);

  // use deprecated method because using @sentry/nestjs along with @sentry/node is problematic
  // as bot modify the global error scope
  Sentry.setupNestErrorHandler(app, new BaseExceptionFilter(httpAdapter));

  await app.listen(config.DASHBOARD.port ?? 8080, () => {
    logger.custom("Dashboard started at port " + config.DASHBOARD.port, "DASHBOARD");
  });
}
