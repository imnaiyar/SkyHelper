import type { SkyHelper } from "@/structures";
import { PermissionsUtil } from "@skyhelperbot/utils";
import type { APIUser } from "@discordjs/core";
import { HttpException, HttpStatus } from "@nestjs/common";
import * as Sentry from "@sentry/node";
/**
 * For Dashboard, validate user perms
 * @param user
 * @param guildID
 */
export async function checkPermissions(user: APIUser, guildID: string, client: SkyHelper) {
  const guild = client.guilds.get(guildID);
  if (!guild) throw new HttpException("Guild Not found", HttpStatus.NOT_FOUND);

  const member = await client.api.guilds.getMember(guildID, user.id);
  Sentry.setUser({ id: user.id, username: member.user.username });
  Sentry.addBreadcrumb({
    category: "user",
    message: "Checking user permissions",
    data: { userID: user.id, username: member.user.username, guildID, guildName: guild.name },
    level: "info",
  });
  const memberPerms = PermissionsUtil.permissionsFor(member, guild);
  if (!memberPerms.has("ManageGuild") && guild.owner_id !== member.user.id) return false;
  return true;
}
