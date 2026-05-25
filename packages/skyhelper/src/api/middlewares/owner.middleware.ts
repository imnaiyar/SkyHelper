import { Injectable, type NestMiddleware, HttpException, HttpStatus } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";
import type { APIUser } from "@discordjs/core";
import type { UserSession } from "../utils/discord.js";
import config from "@/config";

export interface AuthRequest extends Request {
  session: UserSession;
  user: APIUser;
}

@Injectable()
export class OwnerMiddleware implements NestMiddleware {
  use(req: AuthRequest, _: Response, next: NextFunction) {
    if (!config.OWNER.includes(req.user.id)) {
      throw new HttpException("Missing access", HttpStatus.UNAUTHORIZED);
    }

    next();
  }
}
