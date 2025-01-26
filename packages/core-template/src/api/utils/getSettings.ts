import type { SkyHelper as BotService } from "@/structures";

/**
 * Get the guild settings from database
 */
export default async (client: BotService, guildId: string) => {
  const guild = client.guilds.get(guildId);
  if (!guild) return null;
  return await client.schemas.getSettings(guild);
};
