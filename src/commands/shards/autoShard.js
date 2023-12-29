const { ApplicationCommandOptionType } = require('discord.js');
const moment = require('moment-timezone');
const { buildShardEmbed } = require('@functions/buildShardEmbed');
const { autoShard } = require('@schemas/autoShard');
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
    userPermissions: ["ManageGuild"],
  },
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    if (!interaction.guild) {
      return interaction.reply('This command can only be used in a server');
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

      const currentDate = moment().tz(interaction.client.timezone);
      const updatedAt = Math.floor(currentDate.valueOf() / 1000);
      const { result } = await buildShardEmbed(currentDate, 'Live Shard');
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
