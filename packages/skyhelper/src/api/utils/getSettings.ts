import type { SkyHelper as BotService } from "#structures";

/**
 * Get the guild settings from database
 */
export default async (client: BotService, guildId: string) => {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return null;
  return await client.database.getSettings(guild);
};
