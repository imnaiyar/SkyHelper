const { ChannelType, EmbedBuilder, WebhookClient, AuditLogEvent } = require("discord.js");
const { getSettings: registerGuild } = require("@schemas/Guild");
const Guild = require('@schemas/guildBlackList.js');
const Logger = require('@src/logger')
const config = require('@root/config.js')
const {topggAutopost} = require('@handler/functions/topgg-autopost')
const { botSettings } = require("@schemas/botStats");

const webhookLogger = process.env.GUILD ? new WebhookClient({ url: process.env.GUILD }) : undefined;

/**
 * @param {import('@root/main')} client
 * @param {import('discord.js').Guild} guild
 */
module.exports = async (client, guild) => {
  if (!guild.available) return;
  if (!guild.members.cache.has(guild.ownerId)) await guild.fetchOwner({ cache: true }).catch(() => {});
  Logger.success(`Guild Joined: ${guild.name} Members: ${guild.memberCount}`);

// Register guild on database
 registerGuild(guild);
  
// Check if joined guild is blacklisted
 let data = await Guild.findOne({ Guild: guild.id}).catch((err) => {}); 
   if (data) {
   const fetchedLogs = await guild.fetchAuditLogs({
	type: AuditLogEvent.BotAdd,
	limit: 1,
});

const firstEntry = fetchedLogs.entries.first();
firstEntry.executor.send(`The server you invited me to is blacklisted for the reason \` ${data.Reason} \`. For that, I've left the server. If you think this is a mistake, you can appeal by joining our support server [here](${config.Support}).`)
await guild.leave();
const embed = new EmbedBuilder()
       .setAuthor({ name: `Blacklisted Server`})
       .setDescription(`${firstEntry.executor.username} tried to invite me to a blacklisted server. I have left the server.`)
       .addFields(
         { name: 'Blacklisted Guild Name', value: `${data.Name}`},
         { name: 'Reason', value: `${data.Reason}`},
         { name: 'Blacklisted Date', value: `${data?.Date || 'Unknown'}`},
         );
     webhookLogger.send({
    username: "Blacklist Server",
    avatarURL: client.user.displayAvatarURL(),
    embeds: [embed],
  });    
return;
 }
 
// Send a guild join Log
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
    )
    .setFooter({ text: `Guild #${client.guilds.cache.size}` });

  webhookLogger.send({
    username: "Join",
    avatarURL: client.user.displayAvatarURL(),
    embeds: [embed],
  });
  
// Update TopGG Stats
 topggAutopost(client);
 
// Update Bot Stats
const settings = await botSettings(client);
  settings.data.servers = client.guilds.cache.size;
  settings.data.members = client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0);
  await settings.save();
}