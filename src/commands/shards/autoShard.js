const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');
const { shardsReply } = require('@shards/sub/shardsReply');
const { autoShard, deleteGuild } = require('@schemas/autoShard');
const { parsePerm } = require('@functions/parsePerm');
const desc = require('@src/cmdDesc');
module.exports = {
  data: {
    name: 'shards-live',
    description: 'auto updating message with live shards details',
    options: [
      {
        name: 'start',
        description: 'configure auto shard',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'channel',
            description: 'channel where shard details should be updated',
            type: ApplicationCommandOptionType.Channel,
            required: true,
          },
        ],
      },
      {
        name: 'stop',
        description: 'stop auto shard',
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
    longDesc: desc.autoShard,
  },
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    if (!interaction.member.permissions.has('ManageGuild')) {
      return interaction.reply({
        content: `You need ${parsePerm('ManageGuild')} to use this command.`,
        ephemeral: true,
      });
    }
    const config = await autoShard(interaction.guild);
    if (sub === 'start') {
      if (config.channelId && config.messageId) {
        const ch = client.channels.cache.get(config.channelId);
        const ms = await ch.messages.fetch(config.messageId);
        return interaction.reply({
          content: `Live Shard is already configured in <#${config.channelId}> for this message ${ms.url}.`,
          ephemeral: true,
        });
      }
      const channel = interaction.options.getChannel('channel');
      if (
        !interaction.guild.members.me.permissionsIn(channel).has('SendMessages')
      ) {
        return interaction.reply({
          content: `I do not have permissions to send messages in <#${channel}>`,
          ephemeral: true,
        });
      }
      const timezone = 'America/Los_Angeles';
      const currentDate = moment().tz(timezone);
      const updatedAt = Math.floor(currentDate.valueOf() / 1000);
      const {
      type,
      location,
      rewards,
      colors,
      showButtons,
      thumbUrl,
      noShard,
      eventStatus,
      timeRemaining,
      currentEvent,
      currentSecondEvent,
      dayOfWeek,
    } = await shardsReply(currentDate);
    let result = new EmbedBuilder()
      .setAuthor({
        name: `Shards Info`,
        iconURL:
          'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925',
      })
      .setTitle(`${noShard}`)
      .setTimestamp(Date.now())
      .setFooter({
        text: 'Live Shard',
        iconURL: client.user.displayAvatarURL(),
      });
    let disabled;
    if (showButtons) {
      result
        .addFields(
          { name: `Shard Type`, value: `${type} (${rewards})`, inline: true },
          { name: 'Location', value: `${location}`, inline: true },
          { name: 'Status', value: `${eventStatus}` },
          { name: 'Countdown', value: `${timeRemaining}`, inline: true },
        )
        .setColor(colors)
        .setThumbnail(thumbUrl);
      disabled = false;
    } else {
      result
        .setImage(
          'https://media.discordapp.net/attachments/867638574571323424/1155727524911923220/5F1548AC-C7DD-4127-AF6F-0BC388-unscreen.gif',
        )
        .setDescription(`**It's a no shard day.**`)
        .setColor('#9fb686');

      disabled = true;
    }
      const msg = await channel.send({
        content: `Last Updated: <t:${updatedAt}:R>`,
        embeds: [result],
      });
      config.channelId = channel.id;
      config.messageId = msg.id;
      await config.save();
      interaction.reply({
        content: `Live Shard configured for <#${channel.id}>. This message ${msg.url} will be updated every 5 minutes with live Shards details.`,
        ephemeral: true,
      });
    } else if (sub === 'stop') {
      if (!config.channelId || !config.messageId) {
        return interaction.reply({
          content: 'Live Shard is already disabled for this server',
          ephemeral: true,
        });
      }
      const ch = client.channels.cache.get(config.channelId);
      ch.messages.fetch(config.messageId).then((m) => {
        if (m) {
          m.delete();
        }
      });

      const mongoose = require('mongoose');

      const guildData = mongoose.model('autoShard');
      await guildData.findOneAndDelete({ _id: interaction.guild.id });

      interaction.reply({
        content: 'Live Shard is disabled',
        ephemeral: true,
      });
    }
  },
};
