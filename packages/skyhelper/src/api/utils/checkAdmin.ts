import config from "@/config";
import type { APIUser } from "@discordjs/core";
import { HttpException, HttpStatus } from "@nestjs/common";
import * as Sentry from "@sentry/node";
/**
 * For Dashboard, validate dashboard admin
 * @param user
 */
export function checkAdmin(user: APIUser) {
  Sentry.addBreadcrumb({
    category: "user",
    message: "Checking if user is admin",
    data: { userID: user.id, username: user.username },
    level: "info",
  });

  if (!config.DASHBOARD.ADMINS.includes(user.id)) {
    throw new HttpException("Missing access", HttpStatus.UNAUTHORIZED);
  }
}
