import type { Event } from "#structures";
import { EmbedBuilder, type TextChannel, WebhookClient } from "discord.js";
import { dblStats, topggAutopost } from "#handlers";
const webhookLogger = process.env.GUILD ? new WebhookClient({ url: process.env.GUILD }) : undefined;

const guildAddHandler: Event<"guildCreate"> = async (client, guild): Promise<void> => {
  if (!guild.available) return;
  if (!guild.members.cache.has(guild.ownerId)) await guild.fetchOwner({ cache: true }).catch(() => {});
  client.logger.success(`Guild Joined: ${guild.name} Members: ${guild.memberCount}`);

  const guildCount = client.guilds.cache.size;
  const userCount = client.guilds.cache.reduce((total, g) => total + g.memberCount, 0);
  const { getSettings: registerGuild } = client.database;
  // Register guild on database
  registerGuild(guild);
  const BlackList = client.database.guildBlackList;
  // Check if joined guild is blacklisted
  const data = await BlackList.findOne({ Guild: guild.id }).catch(() => {});
  if (data) {
    const owner = await client.users.fetch(guild.ownerId);
    owner
      .send(
        `An attempt to invite me to your server was made, your server is blacklisted from inviting me for the reason \` ${data.Reason} \`. For that, I've left the server. If you think this is a mistake, you can appeal by joining our support server [here](${client.config.Support}).`,
      )
      .catch(() => {});
    await guild.leave();

    const embed = new EmbedBuilder()
      .setAuthor({ name: `Blacklisted Server` })
      .setDescription(`Someone tried to invite me to a blacklisted server.`)
      .addFields(
        { name: "Blacklisted Guild Name", value: `${data.Name}` },
        { name: "Reason", value: `${data.Reason}` },
        { name: "Blacklisted Date", value: `${data?.Date || "Unknown"}` },
      );
    webhookLogger?.send({
      username: "Blacklist Server",
      avatarURL: client.user.displayAvatarURL(),
      embeds: [embed],
    });
    return;
  }

  // updates bot info stats on support server.
  const channels = client.channels.cache.get("1158068842040414351") as TextChannel;
  if (channels) {
    const botInfo = new EmbedBuilder()
      .setAuthor({
        name: "Bot's Information",
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(
        `**Bot's Name:** ${
          client.user.displayName
        }\n**Total Servers**: ${guildCount}\n**Total Users**: ${userCount}\n**Total Commands**: ${
          client.application.commands.cache.size + 3
        }`,
      )
      .setColor(2895153)
      .setFooter({
        text: `Last Updated: ${new Date().toLocaleString("en-GB")}`,
      });
    channels.messages.fetch("1179858980923768893").then((m) => {
      m.edit({ embeds: [botInfo] }).catch((err) => client.logger.log(err));
    });
  }

  // Update DBL Stats
  if (process.env.DBL_TOKEN) {
    await dblStats(client);
  }
  // Update TopGG Stats
  if (process.env.TOPGG_TOKEN) {
    topggAutopost(client);
  }

  // Update Bot Stats
  const settings = await client.database.botSettings(client);
  settings.data.servers = guildCount;
  settings.data.members = userCount;
  await settings.save();

  // Send a guild join Log
  if (!process.env.GUILD) return;

  const embed = new EmbedBuilder()
    .setTitle("Guild Joined")
    .setThumbnail(guild.iconURL())
    .setColor("DarkAqua")
    .addFields(
      {
        name: "Guild Name",
        value: guild.name,
        inline: false,
      },
      {
        name: "ID",
        value: guild.id,
        inline: false,
      },
      {
        name: "Owner",
        value: `${client.users.cache.get(guild.ownerId)?.username} [\`${guild.ownerId}\`]`,
        inline: false,
      },
      {
        name: "Members",
        value: `\`\`\`yaml\n${guild.memberCount}\`\`\``,
        inline: false,
      },
    )
    .setFooter({ text: `Guild #${client.guilds.cache.size}` });

  webhookLogger?.send({
    username: "Join",
    avatarURL: client.user.displayAvatarURL(),
    embeds: [embed],
  });
};

export default guildAddHandler;
