const { ApplicationCommandOptionType, WebhookClient, MessageFlags, EmbedBuilder, ChannelType } = require("discord.js");
const moment = require("moment-timezone");
const { autoShard } = require("@schemas/autoShard");
const { buildShardEmbed, deleteSchema } = require("@src/handler");

/**
 * @type {import("@src/frameworks").SlashCommands}
 */
module.exports = {
  data: {
    name: "shards-live",
    description: "auto updating message with live shards details",
    options: [
      {
        name: "start",
        description: "configure auto shard",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel where shard details should be updated",
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "stop",
        description: "stop auto shard",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
    integration_types: [0],
    contexts: [0],
    dm_permission: false,
    botPermissions: ["ManageWebhooks"],
    userPermissions: ["ManageGuild"],
  },
  /**
   * @param {import('discord.js').Interaction} interaction
   * @param {import('@src/frameworks').SkyHelper} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.guild) {
      return interaction.followUp("This command can only be used in a server");
    }
    const sub = interaction.options.getSubcommand();
    const config = await autoShard(interaction.guild);
    if (sub === "start") {
      if (config.messageId && config.webhook?.id) {
        const wbh = await client.fetchWebhook(config.webhook.id, config.webhook.token).catch(() => {});
        const ms = await wbh.fetchMessage(config.messageId).catch((err) => {});
        if (ms) {
          return interaction.followUp({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `Live Shards is already configured in <#${wbh.channelId}> for this this message ${ms.url}.`,
                )
                .setColor("Red"),
            ],
          });
        }
      }
      const channel = interaction.options.getChannel("channel");

      /*
      This probably won't trigger ever since command option won't allow any other channel type, but putting it here just in case  
      */
      if (!channel.isTextBased() || channel.isVoiceBased()) {
        return interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setDescription(`${channel} is not a text channel. Please provide a valid text channel`)
              .setColor("Red"),
          ],
        });
      }
      if (!channel.permissionsFor(interaction.guild.members.me).has('ManageWebhooks')) {
          return await interaction.editReply(`I do not have \`Manage Webhooks\` permission in ${channel}. Please make sure that there is no channel level permission overwrides and if there is, please grant me the necessary permissions in the said channel before running the command again.`);
        }
      const wb = await client.createWebhook(channel, "For live Shards Update");
      const currentDate = moment().tz(interaction.client.timezone);
      const updatedAt = Math.floor(currentDate.valueOf() / 1000);
      const { result } = await buildShardEmbed(currentDate, "Live Shard");
      const msg = await wb.send({
        username: "Shards Updates",
        avatarURL: client.user.displayAvatarURL(),
        content: `Last Updated: <t:${updatedAt}:R>`,
        embeds: [result],
      });
      config.messageId = msg.id;
      config.webhook.id = wb.id;
      config.webhook.token = wb.token;
      await config.save();
      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `Live Shard configured for <#${channel.id}>. This message ${msg.url} will be updated every 5 minutes with live Shards details.`,
            )
            .setColor("Green"),
        ],
      });
    } else if (sub === "stop") {
      if (!config.webhook.id || !config.messageId) {
        return await interaction.followUp({
          embeds: [new EmbedBuilder().setDescription("Live Shard is already disabled for this server").setColor("Red")],
        });
      }

      const wbh = await client.fetchWebhook(config.webhook.id, config.webhook.token).catch(() => {});
      if (!wbh) {
        await interaction.followUp({
          embeds: [
            new EmbedBuilder().setDescription("Live SkyTimes is already disabled for this server").setColor("Red"),
          ],
        });
        return;
      }
      try {
        await wbh.deleteMessage(config.messageId).catch(() => {});
        await wbh.delete();
        await deleteSchema("autoShard", interaction.guild.id);

        await interaction.followUp({
          embeds: [new EmbedBuilder().setDescription("Live Shard is disabled").setColor("Red")],
        });
      } catch (err) {
        client.logger.error("Failed to stop Shards Updates in " + interaction.guild.name, err);
      }
    }
  },
};
