import { Inject, Injectable, type NestMiddleware } from "@nestjs/common";
import { type UserSession } from "../utils/discord.js";
import type { Request, Response, NextFunction } from "express";
import { SkyHelper } from "@/structures";
import type { APIUser } from "@discordjs/core";
import { checkAdmin } from "../utils/checkAdmin.js";

export interface AuthRequest extends Request {
  session: UserSession;
  user: APIUser;
}

@Injectable()
export class UpdateMiddleware implements NestMiddleware {
  constructor(@Inject("BotClient") private readonly bot: SkyHelper) {}

  async use(req: AuthRequest, _: Response, next: NextFunction) {
    checkAdmin(req.user), next();
  }
}
