import { Inject, Injectable, type NestMiddleware, HttpException, HttpStatus } from "@nestjs/common";
import { type UserSession } from "../utils/discord.js";
import type { Request, Response, NextFunction } from "express";
import { SkyHelper } from "@/structures";
import type { APIUser } from "@discordjs/core";
import { checkPermissions } from "../utils/checkPermissions.js";
import { checkAdmin } from "../utils/checkAdmin.js";

export interface AuthRequest extends Request {
  session: UserSession;
  user: APIUser;
}

@Injectable()
export class GuildMiddleware implements NestMiddleware {
  constructor(@Inject("BotClient") private readonly bot: SkyHelper) {}

  async use(req: AuthRequest, _: Response, next: NextFunction) {
    const guildId = req.url.split("/")[1];
    const isAdmin = checkAdmin(req.user);
    // return early for admins since admin might not be a member
    if (isAdmin) {
      next();
      return;
    }
    const hasPerm = await checkPermissions(req.user, guildId, this.bot);

    if (!hasPerm) {
      throw new HttpException("Missing permissions", HttpStatus.UNAUTHORIZED);
    }
    next();
  }
}
