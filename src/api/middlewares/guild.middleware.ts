import { Inject, Injectable, type NestMiddleware } from "@nestjs/common";
import { type UserSession } from "../utils/discord.js";
import type { Request, Response, NextFunction } from "express";
import { SkyHelper } from "#bot/structures/SkyHelper";

export interface AuthRequest extends Request {
  session: UserSession;
}

@Injectable()
export class GuildMiddleware implements NestMiddleware {
  constructor(@Inject("BotClient") private readonly bot: SkyHelper) {}

  async use(req: AuthRequest, _: Response, next: NextFunction) {
    const guildId = req.url.split("/")[1];
    await this.bot.checkPermissions(req.session, guildId);

    next();
  }
}
