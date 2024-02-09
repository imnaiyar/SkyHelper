const { ApplicationCommandOptionType, WebhookClient } = require("discord.js");
const moment = require("moment-timezone");
const { autoShard } = require("@schemas/autoShard");
const { buildShardEmbed, deleteSchema } = require("@src/handler");
const desc = require("@src/cmdDesc");

/**
 * @type {import("@src/structures").SlashCommands}
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
            required: true,
          },
          {
            name: "name",
            description: "name of the webhook used to send the live updates (default: Shards Update)",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
          {
            name: "avatar",
            description: "avatar to be used for the webhook used to send live updates (default: Bot's Avatar)",
            type: ApplicationCommandOptionType.Attachment,
            required: false,
          },
        ],
      },
      {
        name: "stop",
        description: "stop auto shard",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
    dm_permission: false,
    longDesc: desc.autoShard,
    botPermissions: ["ManageWebhooks"],
    userPermissions: ["ManageGuild"],
  },
  /**
   * @param {import('discord.js').Interaction} interaction
   * @param {import('@src/structures').SkyHelper} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.guild) {
      return interaction.followUp("This command can only be used in a server");
    }
    const sub = interaction.options.getSubcommand();
    const config = await autoShard(interaction.guild);
    if (sub === "start") {
      if (config.messageId && config.webhookURL) {
        const wbh = new WebhookClient({ url: config.webhookURL });
        const ms = await wbh.fetchMessage(config.messageId).catch((err) => {});
        if (ms) {
          return interaction.followUp({
            content: `Live Shards is already configured in <#${config.channelId}> for this message https://discord.com/channels/${interaction.guild.id}/${config.channelId}/${ms.id}.`,
          });
        }
      }
      const channel = interaction.options.getChannel("channel");
      if (!channel.isTextBased() || channel.isVoiceBased()) {
        return interaction.followUp({
          content: `${channel} is not a text channel. Please provide a valid text channel`,
        });
      }
      const name = interaction.options.getString("name");
      const avatar = interaction.options.getAttachment("avatar");
      const wb = await client.createWebhook(channel, "For live Shards Update", name, avatar?.url);
      const currentDate = moment().tz(interaction.client.timezone);
      const updatedAt = Math.floor(currentDate.valueOf() / 1000);
      const { result } = await buildShardEmbed(currentDate, "Live Shard");
      const msg = await wb.send({
        content: `Last Updated: <t:${updatedAt}:R>`,
        embeds: [result],
      });
      config.channelId = channel.id;
      config.messageId = msg.id;
      config.webhookURL = wb.url;
      await config.save();
      interaction.followUp({
        content: `Live Shard configured for <#${channel.id}>. This message ${msg.url} will be updated every 5 minutes with live Shards details.`,
      });
    } else if (sub === "stop") {
      if (!config.webhookURL || !config.messageId) {
        return interaction.followUp({
          content: "Live Shard is already disabled for this server",
        });
      }

      const wbh = new WebhookClient({ url: config.webhookURL });
      try {
        await wbh.deleteMessage(config.messageId);
        await wbh.delete();
        await deleteSchema("autoShard", interaction.guild.id);

        interaction.followUp({
          content: "Live Shard is disabled",
        });
      } catch (err) {
        client.logger.error("Failed to stop Shards Updates in " + interaction.guild.name, err);
      }
    }
  },
};
