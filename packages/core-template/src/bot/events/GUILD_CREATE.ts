import { GatewayDispatchEvents } from "@discordjs/core";
import type { Event } from "../structures/Event.js";

const guildCreateHandler: Event<GatewayDispatchEvents.GuildCreate> = (client, { data: guild }) => {
  console.log(client.unavailableGuilds.size);
  // Discord sends GUILD_CREATE for unavailable guilds when initially connecting
  // Do nothing if that's the case
  if (client.unavailableGuilds.has(guild.id)) {
    client.unavailableGuilds.delete(guild.id);
    // Bot's member will always be present in the payload. This data is updated with GUILD_MEMBER_UPDATE to ensure it's upto date
    // Client member is used for many things like checking permissions, etc
    client.guilds.set(guild.id, { ...guild, clientMember: guild.members.find((m) => m.user.id === client.user.id)! });
    for (const channel of guild.channels) {
      client.channels.set(channel.id, channel);
    }
  }
  if (guild.unavailable) return;
};

export default guildCreateHandler;
