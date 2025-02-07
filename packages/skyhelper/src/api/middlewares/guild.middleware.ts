import { Inject, Injectable, type NestMiddleware } from "@nestjs/common";
import { type UserSession } from "../utils/discord.js";
import type { Request, Response, NextFunction } from "express";
import { SkyHelper } from "@/structures";
import type { APIUser } from "@discordjs/core";
import { checkPermissions } from "../utils/checkPermissions.js";

export interface AuthRequest extends Request {
  session: UserSession;
  user: APIUser;
}

@Injectable()
export class GuildMiddleware implements NestMiddleware {
  constructor(@Inject("BotClient") private readonly bot: SkyHelper) {}

  async use(req: AuthRequest, _: Response, next: NextFunction) {
    const guildId = req.url.split("/")[1];
    await checkPermissions(req.user, guildId, this.bot);
    next();
  }
}
