const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');
const { shardsReply } = require('@shards/sub/shardsReply');
const { autoShard, deleteGuild } = require('@schemas/autoShard');
const { parsePerm } = require('@functions/parsePerm');
const desc = require('@src/cmdDesc');
module.exports = {
  data: {
    name: 'auto-shard',
    description: 'auto updating message with shards details',
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
        return interaction.reply({
          content: `Auto Shard is already configured for <#${config.channelId}>.`,
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
      const result = await shardsReply(false, currentDate);
      const msg = await channel.send({
        content: `Last Updated: <t:${updatedAt}:R>`,
        embeds: [result],
      });
      config.channelId = channel.id;
      config.messageId = msg.id;
      await config.save();
      interaction.reply({
        content: `Auto Shard configured for <#${channel.id}>`,
        ephemeral: true,
      });
    } else if (sub === 'stop') {
      if (!config.channelId || !config.messageId) {
        return interaction.reply({
          content: 'Auto Shard is already disabled for this server',
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
        content: 'Auto Shard is disabled',
        ephemeral: true,
      });
    }
  },
};
