import { NestFactory } from "@nestjs/core";
import config from "../bot/config.js";
import { logger } from "#handlers";
import { SkyHelper } from "#structures";
import { type MiddlewareConsumer, Module, type NestModule } from "@nestjs/common";
import { AppController } from "./controllers/app.controller.js";
import { GuildController } from "./controllers/guild.controller.js";
import { AuthMiddleware } from "./middlewares/auth.middleware.js";
import { StatsController } from "./controllers/stats.controller.js";
import { UpdateController } from "./controllers/update.controller.js";
import { UsersController } from "./controllers/user.controller.js";
import { GuildMiddleware } from "./middlewares/guild.middleware.js";
export async function Dashboard(client: SkyHelper) {
  @Module({
    imports: [],
    controllers: [AppController, GuildController, StatsController, UpdateController, UsersController],
    providers: [{ provide: "BotClient", useValue: client }],
  })
  class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
      consumer.apply(AuthMiddleware).forRoutes("guilds", "update");
      consumer.apply(GuildMiddleware).forRoutes("guilds");
    }
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
    maxAge: 40,
    origin: config.DASHBOARD.WEB_URL,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "HEAD", "POST", "DELETE", "PATCH"],
  });

  await app.listen(config.DASHBOARD.port ?? 8080, () => {
    logger.log("Dashboard started at port " + config.DASHBOARD.port, "DASHBOARD");
  });
}
