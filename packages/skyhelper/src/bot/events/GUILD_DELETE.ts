import type { Event } from "@/structures/Event";
import type { GatewayDispatchEvents } from "@discordjs/core";
import { sendGuildLog, updateBotStatsMessage } from "./GUILD_CREATE.js";

const guildDeleteHandler: Event<GatewayDispatchEvents.GuildDelete> = async (client, { data: g }) => {
  // if guild is unavailable due to outage, add to unavailable guilds and return
  if (g.unavailable) {
    client.unavailableGuilds.add(g.id);
    return;
  }
  const guild = client.guilds.get(g.id);
  if (!guild) return; // Sometimes you get the event for previously deleted guilds on restart. ignore

  // Delete guild from cache
  client.guilds.delete(g.id);

  // Delete all channels belonging to this guild from cache
  for (const channel of guild.channels) {
    client.channels.delete(channel.id);
  }

  client.logger.custom(`Guild: ${guild.name} (${guild.id}); Members: ${guild.member_count}`, "Guild Left");

  // Delete from db
  await client.schemas.GuildModel.deleteOne({ _id: g.id });

  await updateBotStatsMessage(client);

  await sendGuildLog(guild, client, "Left");
};

export default guildDeleteHandler;
