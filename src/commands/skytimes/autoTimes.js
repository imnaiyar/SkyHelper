const { ApplicationCommandOptionType } = require('discord.js');
const moment = require('moment-timezone');
const { buildTimesEmbed } = require('@functions/buildTimesEmbed');
const { autoTimes } = require('@schemas/autoTimes');
const { parsePerm } = require('@functions/parsePerm');
const desc = require('@src/cmdDesc');
module.exports = {
  data: {
    name: 'sky-times-live',
    description:
      'auto updating message with live in-game events details/countdown',
    options: [
      {
        name: 'start',
        description: 'configure live SkyTimes',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'channel',
            description: 'channel where SkyTimes details should be updated',
            type: ApplicationCommandOptionType.Channel,
            required: true,
          },
        ],
      },
      {
        name: 'stop',
        description: 'stop live SkyTimes',
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
    longDesc: desc.autoTimes,
  },
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    if (!interaction.guild) {
      return interaction.reply('This command can only be used in a server');
    }
    if (!interaction.member.permissions.has('ManageGuild')) {
      return interaction.reply({
        content: `You need ${parsePerm('ManageGuild')} to use this command.`,
        ephemeral: true,
      });
    }
    const config = await autoTimes(interaction.guild);
    if (sub === 'start') {
      if (config.channelId && config.messageId) {
        const ch = client.channels.cache.get(config.channelId);
        const ms = await ch.messages.fetch(config.messageId);
        return interaction.reply({
          content: `Live SkyTimes is already configured in <#${config.channelId}> for this message ${ms.url}.`,
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
      const { result } = await buildTimesEmbed(client, 'Live SkyTimes');
      const msg = await channel.send({
        content: `Last Updated: <t:${updatedAt}:R>`,
        embeds: [result],
      });
      config.channelId = channel.id;
      config.messageId = msg.id;
      await config.save();
      interaction.reply({
        content: `Live SkyTimes configured for <#${channel.id}>. This message ${msg.url} will be updated every 2 minutes with live in-game events (grandma, geyser, etc.) details.`,
        ephemeral: true,
      });
    } else if (sub === 'stop') {
      if (!config.channelId || !config.messageId) {
        return interaction.reply({
          content: 'Live SkyTimes is already disabled for this server',
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

      const guildData = mongoose.model('autoTimes');
      await guildData.findOneAndDelete({ _id: interaction.guild.id });

      interaction.reply({
        content: 'Live SkyTimes is disabled',
        ephemeral: true,
      });
    }
  },
};
