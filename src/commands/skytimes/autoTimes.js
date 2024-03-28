const { ApplicationCommandOptionType, WebhookClient, MessageFlags, ChannelType } = require("discord.js");
const moment = require("moment-timezone");
const { autoTimes } = require("@schemas/autoTimes");
const { buildTimesEmbed, deleteSchema } = require("@src/handler");

module.exports = {
  data: {
    name: "sky-times-live",
    description: "auto updating message with live in-game events details/countdown",
    options: [
      {
        name: "start",
        description: "configure live SkyTimes",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel where SkyTimes details should be updated",
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "stop",
        description: "stop live SkyTimes",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
    dm_permission: false,
    integration_types: [0],
    contexts: [0], 
    botPermissions: ["ManageWebhooks"],
    userPermissions: ["ManageGuild"],
  },
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.guild) {
      return interaction.followUp("This command can only be used in a server");
    }
    const sub = interaction.options.getSubcommand();
    const config = await autoTimes(interaction.guild);
    if (sub === "start") {
      if (config.messageId && config.webhook?.id) {
        const wbh = await client.fetchWebhook(config.webhook.id, config.webhook.token).catch(() => {});
        const ms = await wbh?.fetchMessage(config.messageId).catch((err) => {});
        if (ms) {
          return interaction.followUp({
            content: `Live SkyTimes is already configured in <#${wbh.channelId}> for this message ${ms.url}.`,
            flags: MessageFlags.SuppressEmbeds
          });
        }
      }
      const channel = interaction.options.getChannel("channel");
      if (!channel.isTextBased() || channel.isVoiceBased()) {
        return interaction.followUp({
          content: `${channel} is not a text channel. Please provide a valid text channel`,
        });
      }

      const wb = await client.createWebhook(channel, "For live SkyTimes Update");
      const currentDate = moment().tz(interaction.client.timezone);
      const updatedAt = Math.floor(currentDate.valueOf() / 1000);
      const { result } = await buildTimesEmbed(client, "Live SkyTimes");
      const msg = await wb.send({
        name: 'SkyTimes Updates',
        avatarURL: client.user.displayAvatarURL(),
        content: `Last Updated: <t:${updatedAt}:R>`,
        embeds: [result],
      });
      config.messageId = msg.id;
      config.webhook.id = wb.id;
      config.webhook.token = wb.token;
      await config.save();
      interaction.followUp({
        content: `Live SkyTimes configured for <#${channel.id}>. This message ${msg.url} will be updated every 2 minutes with live in-game events (grandma, geyser, etc.) details.`,
        flags: MessageFlags.SuppressEmbeds
      });
    } else if (sub === "stop") {
      if (!config?.webhook.id || !config.messageId) {
        return interaction.followUp({
          content: "Live SkyTimes is already disabled for this server",
        });
      }
      const wbh = await client.fetchWebhook(config.webhook.id, config.webhook.token).catch(() => {});
      if (!wbh) {
        await interaction.followUp('Live SkyTimes is already disabled for this server');
        return;
      }
      try {
        await wbh.deleteMessage(config.messageId);
        await wbh.delete();
        await deleteSchema("autoTimes", interaction.guild.id);

        interaction.followUp({
          content: "Live SkyTimes is disabled",
        });
      } catch (err) {
        client.logger.error("Failed to stop SkyTimes Updates in " + interaction.guild.name, err);
      }
    }
  },
};