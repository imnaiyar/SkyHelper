import type { Event } from "@/structures/Event";
import type { GatewayDispatchEvents } from "@discordjs/core";
import { sendGuildLog, updateBotStatsMessage } from "./GUILD_CREATE.js";

const guildDeleteHandler: Event<GatewayDispatchEvents.GuildDelete> = async (client, { data: g }) => {
  if (g.unavailable) return;

  const guild = { ...client.guilds.get(g.id)! };

  // Delete guild from cache
  client.guilds.delete(g.id);

  // Delete all channels belonging to this guild from cache
  for (const channel of guild.channels) {
    client.channels.delete(channel.id);
  }

  client.logger.custom(`Guild: ${guild.name} (${guild.id}); Members: ${guild.member_count}`, "Guild Left");

  // Delete from db
  await client.schemas.GuildModel.deleteOne({ id: g.id });

  await updateBotStatsMessage(client);

  await sendGuildLog(guild, client, "Left");
};

export default guildDeleteHandler;
