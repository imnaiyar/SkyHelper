import { GatewayDispatchEvents, type APIEmbed, type GatewayGuildCreateDispatchData, type APIGuildMember } from "@discordjs/core";
import type { Event } from "../structures/Event.js";
import { postBotListStats } from "@/utils/postBotLists";
import { resolveColor } from "@skyhelperbot/utils";
import type { SkyHelper } from "@/structures/Client";

const guildCreateHandler: Event<GatewayDispatchEvents.GuildCreate> = async (client, { data: guild }) => {
  if (guild.unavailable) return; // this will never be sent to create event, but still ig

  // #region Populate Cache
  const clientMember = guild.members.find((m) => m.user.id === client.user.id)!;

  // Bot's member will always be present in the payload.
  // This data is updated with GUILD_MEMBER_UPDATE to ensure it's upto date
  // Client member is used for many things like checking permissions, etc
  client.guilds.set(guild.id, {
    ...guild,
    clientMember,
    channels: guild.channels.map((c) => ({
      ...c,
      guild_id: guild.id,
    })),
  });

  // Populate channels cache
  for (const channel of guild.channels) {
    // Guild ID is missing for channels recived via gateway ig
    client.channels.set(channel.id, { ...channel, guild_id: guild.id });
  }

  // Discord sends GUILD_CREATE for unavailable guilds when initially connecting or when an unavailable guild becomes available
  // Do nothing if that's the case
  if (client.unavailableGuilds.has(guild.id)) {
    client.unavailableGuilds.delete(guild.id);
    return;
  }

  client.logger.custom(`Guild: ${guild.name} (${guild.id}); Members: ${guild.member_count}`, "Guild Joined");

  // register guild on db
  await client.schemas.getSettings({ ...guild, clientMember });

  // update bot stats message
  await updateBotStatsMessage(client);

  // update statistics
  await client.schemas.StatisticsModel.create({ guildEvent: { event: "join", guildId: guild.id }, timestamp: new Date() });

  // Post stats to bot lists
  await postBotListStats(client);

  // Send a guild join Log
  await sendGuildLog({ ...guild, clientMember }, client);
};

export default guildCreateHandler;

export async function sendGuildLog(
  guild: GatewayGuildCreateDispatchData & { clientMember: APIGuildMember },
  client: SkyHelper,
  event: "Joined" | "Left" = "Joined",
) {
  // Send a guild join Log
  if (!process.env.GUILD) return;
  const parsed = client.utils.parseWebhookURL(process.env.GUILD);
  if (!parsed) return;
  const ownerUsername = await client.api.users
    .get(guild.owner_id)
    .then((u) => u.username)
    .catch(() => "Unknown");

  const logEmbed: APIEmbed = {
    title: `Guild ${event}`,
    color: resolveColor("DarkAqua"),
    ...(guild.icon && { thumbnail: { url: client.rest.cdn.icon(guild.id, guild.icon) } }),
    fields: [
      {
        name: "Name",
        value:
          guild.name +
          `\n- -# Created At: ${client.utils.time(Math.floor(client.utils.getTimestampFromSnowflake(guild.id) / 1_000), "F")}\n- -# Joined At: ${client.utils.time(new Date(guild.clientMember.joined_at!), "F")}`,
        inline: true,
      },
      { name: "ID", value: guild.id, inline: true },
      { name: "Owner", value: `${ownerUsername} [\`${guild.owner_id}\`]`, inline: true },
      { name: "Members", value: guild.member_count.toString(), inline: true },
    ],
    footer: { text: `Guild No: ${client.guilds.size}` },
  };

  return client.api.webhooks.execute(parsed.id, parsed.token, { embeds: [logEmbed] }).catch(client.logger.error);
}

export async function updateBotStatsMessage(client: SkyHelper) {
  if (process.env.NODE_ENV !== "production") return;

  const botInfo: APIEmbed = {
    author: { name: "Bot's Information", icon_url: client.utils.getUserAvatar(client.user) },
    description: `**Bot's Name:** ${
      client.user.global_name
    }\n**Total Servers**: ${client.guilds.size}\n**Total Users**: ${client.guilds.reduce(
      (acc, g) => acc + g.member_count,
      0,
    )}\n**Total Commands**: ${client.commands.filter((c) => !c.ownerOnly).size}\n\n-# Last Updated: ${client.utils.time(Math.floor(Date.now() / 1_000), "F")}`,
    color: 2895153,
  };

  return client.api.channels
    .editMessage(client.config.BOT_STATs.CHANNEL, client.config.BOT_STATs.MESSAGE_ID, { embeds: [botInfo] })
    .catch(client.logger.error);
}
