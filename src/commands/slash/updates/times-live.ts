import { getTimesEmbed } from "#handlers";
import { ContextTypes, IntegrationTypes } from "#libs";
import type { SlashCommand } from "#structures";
import { ApplicationCommandOptionType, ChannelType, EmbedBuilder, TextChannel } from "discord.js";
import moment from "moment";
import { useTranslations as x } from "#handlers/useTranslation";
export default {
  data: {
    name: "skytimes-live",
    name_localizations: x("commands.SKYTIMES_LIVE.name"),
    description: "auto updating message with live skytimes details",
    description_localizations: x("commands.SKYTIMES_LIVE.description"),
    options: [
      {
        name: "start",
        name_localizations: x("commands.SKYTIMES_LIVE.options.START.name"),
        description: "configure auto skytimes",
        description_localizations: x("commands.SKYTIMES_LIVE.options.START.description"),
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            name_localizations: x("commands.SKYTIMES_LIVE.options.START.option.CHANNEL.name"),
            description: "channel where skytimes details should be updated",
            description_localizations: x("commands.SKYTIMES_LIVE.options.START.option.CHANNEL.description"),
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "stop",
        name_localizations: x("commands.SKYTIMES_LIVE.options.STOP.name"),
        description: "stop auto skytimes",
        description_localizations: x("commands.SKYTIMES_LIVE.options.STOP.description"),
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
    integration_types: [IntegrationTypes.Guilds],
    contexts: [ContextTypes.Guild],
    botPermissions: ["ManageWebhooks"],
    userPermissions: ["ManageGuild"],
  },
  async execute(interaction, t, client) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.inCachedGuild()) {
      return void (await interaction.followUp("This command can only be used in a server"));
    }
    const sub = interaction.options.getSubcommand();
    const config = await client.database.getSettings(interaction.guild);
    if (sub === "start") {
      if (config.autoTimes.messageId && config.autoTimes.webhook?.id) {
        const wbh = await client
          .fetchWebhook(config.autoTimes.webhook.id, config.autoTimes.webhook.token as unknown as string)
          .catch(() => {});
        const ms = await wbh?.fetchMessage(config.autoTimes.messageId).catch(() => {});
        if (ms && wbh) {
          await interaction.followUp({
            embeds: [
              new EmbedBuilder()
                .setDescription(`Live SkyTimes is already configured in <#${wbh.channelId}> for this this message ${ms.url}.`)
                .setColor("Red"),
            ],
          });
          return;
        }
      }
      const channel = interaction.options.getChannel("channel")! as TextChannel;

      /*
      This probably won't trigger ever since command option won't allow any other channel type, but putting it here just in case
      */
      if (!channel.isTextBased() || channel.isVoiceBased()) {
        return void (await interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setDescription(`${channel} is not a text channel. Please provide a valid text channel`)
              .setColor("Red"),
          ],
        }));
      }
      if (!channel.permissionsFor(interaction.guild.members.me!).has("ManageWebhooks")) {
        return void (await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `I do not have \`Manage Webhooks\` permission in ${channel}. Please make sure that there is no channel level permission overwrides and if there is, please grant me the necessary permissions in the said channel before running the command again.`,
              )
              .setColor("Red"),
          ],
        }));
      }
      const wb = await client.createWebhook(channel, "For live SkyTimes Update");
      const currentDate = moment().tz(client.timezone);
      const updatedAt = Math.floor(currentDate.valueOf() / 1000);
      const result = {
        embeds: [await getTimesEmbed(client, t, "Live SkyTimes (updates every 2 minutes)")],
      };
      const msg = await wb.send({
        username: "SkyTimes Updates",
        avatarURL: client.user.displayAvatarURL(),
        content: `Last Updated: <t:${updatedAt}:R>`,
        ...result,
      });
      config.autoTimes.active = true;
      config.autoTimes.messageId = msg.id;
      config.autoTimes.webhook.id = wb.id;
      config.autoTimes.webhook.token = wb.token;
      await config.save();
      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `Live SkyTimes configured for <#${channel.id}>. This message ${msg.url} will be updated every 5 minutes with live SkyTimes details.`,
            )
            .setColor("Green"),
        ],
      });
    } else if (sub === "stop") {
      if (!config.autoTimes.webhook.id || !config.autoTimes.messageId) {
        return void (await interaction.followUp({
          embeds: [new EmbedBuilder().setDescription("Live SkyTimes is already disabled for this server").setColor("Red")],
        }));
      }

      const wbh = await client
        .fetchWebhook(config.autoTimes.webhook.id, config.autoTimes.webhook.token as unknown as string)
        .catch(() => {});
      if (!wbh) {
        await interaction.followUp({
          embeds: [new EmbedBuilder().setDescription("Live SkyTimes is already disabled for this server").setColor("Red")],
        });
        return;
      }
      try {
        await wbh.deleteMessage(config.autoTimes.messageId).catch(() => {});
        await wbh.delete();
        config.autoTimes.active = false;
        config.autoTimes.webhook.id = null;
        config.autoTimes.webhook.token = null;

        await interaction.followUp({
          embeds: [new EmbedBuilder().setDescription("Live SkyTimes is disabled").setColor("Red")],
        });
      } catch (err) {
        client.logger.error("Failed to stop SkyTimes Updates in " + interaction.guild.name, err);
      }
    }
  },
} satisfies SlashCommand;
