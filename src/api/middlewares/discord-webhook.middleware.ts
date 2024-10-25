import { Injectable, type NestMiddleware } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";
import { verifyKeyMiddleware } from "../verifyKeyMiddleware.js";

@Injectable()
export class WebhookEventMiddleware implements NestMiddleware {
  constructor() {}

  async use(req: Request, res: Response, next: NextFunction) {
    verifyKeyMiddleware(process.env.PUBLIC_KEY!)(req, res, next);
  }
}
