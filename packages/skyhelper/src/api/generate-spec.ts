import { Module, type NestModule } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppController } from "./controllers/app.controller.js";
import { GuildController } from "./controllers/guild.controller.js";
import { BotController } from "./controllers/bot.controller.js";
import { UpdateController } from "./controllers/update.controller.js";
import { UsersController } from "./controllers/user.controller.js";
import { WebhookEventController } from "./controllers/discord-webhooks.controller.js";
import { DocumentBuilder, SwaggerModule, type SwaggerDocumentOptions } from "@nestjs/swagger";
import { writeFile } from "fs/promises";
import path from "path";

@Module({
  providers: [{ provide: "BotClient", useValue: "client" }],
  controllers: [AppController, GuildController, BotController, UpdateController, UsersController, WebhookEventController],
})
class AppModule implements NestModule {
  configure() {}
}

const app = await NestFactory.create(AppModule);

const options: SwaggerDocumentOptions = {
  operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey,
};
const c = new DocumentBuilder()
  .setTitle("SkyHelper API")
  .setDescription("API Documentation for SkyHelper")
  .setVersion("1.0")
  .addTag("skyhelper")
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, c, options);

await writeFile(path.resolve(import.meta.dirname, "openapi-spec.json"), JSON.stringify(document, null, 2));
