const {  EmbedBuilder, WebhookClient } = require('discord.js');
const { botSettings } = require('@schemas/botStats');
const { getSettings } = require('@schemas/Guild');
const Logger = require('@src/logger');

const webhookLogger = process.env.GUILD
  ? new WebhookClient({ url: process.env.GUILD })
  : undefined;

/**
 * @param {import('@root/main')} client
 * @param {import('discord.js').Guild} guild
 */

module.exports = async (client, guild) => {
  if (!guild.available) return;
  Logger.success(`Guild Left: ${guild.name} Members: ${guild.memberCount}`);
  const settings = await getSettings(guild);
  const settings1 = await botSettings(client);
  settings1.data.servers = client.guilds.cache.size;
  settings1.data.members = client.guilds.cache.reduce(
    (total, guild) => total + guild.memberCount,
    0,
  );
  settings.data.leftAt = new Date();
  await settings.save();
  await settings1.save();

  if (!webhookLogger) return;

  let ownerTag;
  const ownerId = guild.ownerId || settings.data.owner;
  try {
    const owner = await client.users.fetch(ownerId);
    ownerTag = owner.username;
  } catch (err) {
    ownerTag = 'Deleted User';
  }

  const embed = new EmbedBuilder()
    .setTitle('Guild Left')
    .setThumbnail(guild.iconURL())
    .setColor('Aqua')
    .addFields(
      {
        name: 'Guild Name',
        value: guild.name || 'NA',
        inline: false,
      },
      {
        name: 'ID',
        value: guild.id,
        inline: false,
      },
      {
        name: 'Owner',
        value: `${ownerTag} [\`${ownerId}\`]`,
        inline: false,
      },
      {
        name: 'Members',
        value: `\`\`\`yaml\n${guild.memberCount}\`\`\``,
        inline: false,
      },
    )
    .setFooter({ text: `Guild #${client.guilds.cache.size}` });

  webhookLogger.send({
    username: 'Leave',
    avatarURL: client.user.displayAvatarURL(),
    embeds: [embed],
  });
};
