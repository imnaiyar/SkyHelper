import { HttpStatus, HttpException } from "@nestjs/common";
import { Injectable, type NestMiddleware } from "@nestjs/common";
import { getUser, type UserSession } from "../utils/discord.js";
import type { Request, Response, NextFunction } from "express";
import type { APIUser } from "@discordjs/core";

function getToken(req: Request): UserSession {
  const data = req.headers.authorization as string | null;

  if (!data?.startsWith("Bearer ")) {
    throw new HttpException("You must login first", HttpStatus.UNAUTHORIZED);
  }

  return {
    token_type: "Bearer",
    access_token: data.slice("Bearer".length).trim(),
  };
}

export interface AuthRequest extends Request {
  session: UserSession;
  user: APIUser;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: AuthRequest, _: Response, next: NextFunction) {
    req.session = getToken(req);
    req.user = await getUser(req.session.access_token);
    next();
  }
}
