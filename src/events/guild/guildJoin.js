const { ChannelType, EmbedBuilder, WebhookClient } = require("discord.js");
const { getSettings: registerGuild } = require("@schemas/Guild");
const { botSettings } = require("@schemas/botStats");
const { client } = require('@root/main');

const webhookLogger = process.env.GUILD ? new WebhookClient({ url: process.env.GUILD }) : undefined;

/**
 * @param {import('discord.js').Guild} guild
 */

client.on('guildCreate', async (guild) => {
  if (!guild.available) return;
  if (!guild.members.cache.has(guild.ownerId)) await guild.fetchOwner({ cache: true }).catch(() => {});
  console.log(`Guild Joined: ${guild.name} Members: ${guild.memberCount}`);
  await registerGuild(guild);
  const settings = await botSettings(client);
  settings.data.servers = client.guilds.cache.size;
  settings.data.members = client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0);
  await settings.save();

  const systemChannel = guild.channels.cache.find((c) => c.type === ChannelType.GuildText);

  if (!systemChannel) return;

  const invite = await systemChannel.createInvite({ reason: `For ${client.user.username} Developer(s)`, maxAge: 0 });

  if (!process.env.GUILD) return;

  const embed = new EmbedBuilder()
    .setTitle("Guild Joined")
    .setThumbnail(guild.iconURL())
    .setColor('DarkAqua')
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
        value: `${client.users.cache.get(guild.ownerId).username} [\`${guild.ownerId}\`]`,
        inline: false,
      },
      {
        name: "Members",
        value: `\`\`\`yaml\n${guild.memberCount}\`\`\``,
        inline: false,
      },
      {
        name: "Guild Invite",
        value: `[Here is ${guild.name} invite ](https://discord.gg/${invite.code})`,
        inline: false,
      }
    )
    .setFooter({ text: `Guild #${client.guilds.cache.size}` });

  webhookLogger.send({
    username: "Join",
    avatarURL: client.user.displayAvatarURL(),
    embeds: [embed],
  });
});