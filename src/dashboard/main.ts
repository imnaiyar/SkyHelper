import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import config from "../config.js";
import { logger } from "#handlers";
export async function Dashboard() {
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
