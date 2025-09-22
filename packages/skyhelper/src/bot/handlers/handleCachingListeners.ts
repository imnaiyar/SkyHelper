import type { SkyHelper } from "@/structures/Client";
import { GatewayDispatchEvents } from "@discordjs/core";

/** Following are the events that are only listened so that the cache (that the bot relies on) is upto date. */
export default (client: SkyHelper) => {
  // client user
  client.on(GatewayDispatchEvents.UserUpdate, ({ data: user }) => {
    if (user.id !== client.user.id) return;
    client.user = Object.assign(client.user, user);
  });

  // #region Guild
  client.on(GatewayDispatchEvents.GuildUpdate, ({ data: guild }) => {
    const oldGuild = client.guilds.get(guild.id);
    if (!oldGuild) return;
    client.guilds.set(guild.id, Object.assign(oldGuild, guild));
  });

  // #region GuildMember
  client.on(GatewayDispatchEvents.GuildMemberUpdate, ({ data: member }) => {
    const guild = client.guilds.get(member.guild_id);
    if (!guild) {
      console.error(`Guild not found for member update: ${member.guild_id}`);
      return;
    }
    if (member.user.id !== client.user.id) return;
    guild.clientMember = Object.assign(guild.clientMember, member);
  });

  client.on(GatewayDispatchEvents.GuildMemberRemove, ({ data: member }) => {
    const guild = client.guilds.get(member.guild_id);
    if (!guild) {
      console.error(`Guild not found for member remove: ${member.guild_id}`);
      return;
    }
    guild.member_count--;
  });

  client.on(GatewayDispatchEvents.GuildMemberAdd, ({ data: member }) => {
    const guild = client.guilds.get(member.guild_id);
    if (!guild) {
      console.error(`Guild not found for member add: ${member.guild_id}`);
      return;
    }
    guild.member_count++;
  });

  // #region GuildRole
  client.on(GatewayDispatchEvents.GuildRoleUpdate, ({ data: role }) => {
    const guild = client.guilds.get(role.guild_id);
    if (!guild) {
      console.error(`Guild not found for role update: ${role.guild_id}`);
      return;
    }
    const oldRole = guild.roles.find((r) => r.id === role.role.id);
    if (!oldRole) return;
    const oldRoleIndex = guild.roles.findIndex((r) => r.id === role.role.id);
    if (oldRoleIndex === -1) return;
    guild.roles[oldRoleIndex] = Object.assign(oldRole, role);
  });

  client.on(GatewayDispatchEvents.GuildRoleDelete, ({ data: role }) => {
    const guild = client.guilds.get(role.guild_id);
    if (!guild) {
      console.error(`Guild not found for role delete: ${role.guild_id}`);
      return;
    }
    const roleIndex = guild.roles.findIndex((r) => r.id === role.role_id);
    if (roleIndex === -1) return;
    guild.roles.splice(roleIndex, 1);
  });

  client.on(GatewayDispatchEvents.GuildRoleCreate, ({ data: role }) => {
    const guild = client.guilds.get(role.guild_id);
    if (!guild) {
      console.error(`Guild not found for role create: ${role.guild_id}`);
      return;
    }
    guild.roles.push(role.role);
  });

  // #region Channel
  client.on(GatewayDispatchEvents.ChannelUpdate, ({ data: channel }) => {
    const oldChannel = client.channels.get(channel.id);
    const guild = client.guilds.get(channel.guild_id)!;

    if (!oldChannel) return;
    client.channels.set(channel.id, Object.assign(oldChannel, channel));

    const channelIndex = guild?.channels.findIndex((c) => c.id === channel.id);
    if (channelIndex === -1) return;
    guild.channels[channelIndex] = Object.assign(guild.channels[channelIndex], channel);
  });
  client.on(GatewayDispatchEvents.ChannelDelete, ({ data: channel }) => {
    const guild = client.guilds.get(channel.guild_id);
    client.channels.delete(channel.id);
    if (!guild) return;
    const channelIndex = guild.channels.findIndex((c) => c.id === channel.id);
    if (channelIndex === -1) return;
    guild.channels.splice(channelIndex, 1);
  });
  client.on(GatewayDispatchEvents.ChannelCreate, ({ data: channel }) => {
    const guild = client.guilds.get(channel.guild_id);
    client.channels.set(channel.id, { ...channel, guild_id: channel.guild_id });
    if (!guild) return;
    guild.channels.push({ ...channel, guild_id: channel.guild_id });
  });
};
