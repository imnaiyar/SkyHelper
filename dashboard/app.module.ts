import { type MiddlewareConsumer, Module, type NestModule } from "@nestjs/common";
import { AppController } from "./controllers/app.controller.js";
import { GuildController } from "./controllers/guild.controller.js";
import { AuthMiddleware } from "./middlewares/auth.middleware.js";
import { BotService } from "./services/bot.service.js";
import { StatsController } from "./controllers/stats.controller.js";

@Module({
  imports: [],
  controllers: [AppController, GuildController, StatsController],
  providers: [BotService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes("guilds");
  }
}
