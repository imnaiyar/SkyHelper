import type { Event } from "#structures";
import { EmbedBuilder, type TextChannel, WebhookClient } from "discord.js";

const webhookLogger = process.env.GUILD ? new WebhookClient({ url: process.env.GUILD }) : undefined;

const guildRemoveHandler: Event<"guildDelete"> = async (client, guild) => {
  if (!guild.available) return;
  client.logger.log(`Guild Left: ${guild.name} Members: ${guild.memberCount}`);

  const guildCount = client.guilds.cache.size;
  const userCount = client.guilds.cache.reduce((total, g) => total + g.memberCount, 0);

  const settings = await client.database.getSettings(guild);
  const settings1 = await client.database.botSettings(client);
  settings1.data.servers = client.guilds.cache.size;
  settings1.data.members = client.guilds.cache.reduce((total, g) => total + g.memberCount, 0);
  settings.data.leftAt = new Date();
  await settings.save();
  await settings1.save();

  let ownerTag;
  const ownerId = guild.ownerId; // || settings.data.owner
  try {
    const owner = await client.users.fetch(ownerId);
    ownerTag = owner.username;
  } catch (err) {
    ownerTag = "Deleted User";
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

  // delete any registered live functions

  const embed = new EmbedBuilder()
    .setTitle("Guild Left")
    .setThumbnail(guild.iconURL())
    .setColor("Aqua")
    .addFields(
      {
        name: "Guild Name",
        value: guild.name || "NA",
        inline: false,
      },
      {
        name: "ID",
        value: guild.id,
        inline: false,
      },
      {
        name: "Owner",
        value: `${ownerTag} [\`${ownerId}\`]`,
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
    username: "Leave",
    avatarURL: client.user.displayAvatarURL(),
    embeds: [embed],
  });
};

export default guildRemoveHandler;
