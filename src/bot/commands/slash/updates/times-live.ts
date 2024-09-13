import { getTimesEmbed } from "#utils";
import type { SlashCommand } from "#structures";
import { ApplicationCommandOptionType, ChannelType, EmbedBuilder, TextChannel } from "discord.js";
import moment from "moment";
import { useTranslations as x } from "#handlers/useTranslation";
import { getTranslator } from "#bot/i18n";
export default {
  async execute(interaction, t, client) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.inCachedGuild()) {
      return void (await interaction.followUp(t("commands.SHARDS_LIVE.RESPONSES.NOT_GUILD")));
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
                .setDescription(
                  t("commands.SHARDS_LIVE.RESPONSES.ALREADY_CONFIGURED", {
                    CHANNEL: `<#${wbh.channelId}>`,
                    MESSAGE: ms.url,
                    TYPE: `"Live SkyTimes"`,
                  }),
                )
                .setColor("Red"),
            ],
          });
          return;
        }
      }
      const channel = interaction.options.getChannel("channel", true);

      /*
      This probably won't trigger ever since command option won't allow any other channel type, but putting it here just in case
      */
      if (!channel.isTextBased() || channel.isVoiceBased()) {
        return void (await interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setDescription(t("commands.SHARDS_LIVE.RESPONSES.INVALID_CHANNEL", { CHANNEL: channel.toString() }))
              .setColor("Red"),
          ],
        }));
      }
      if (!channel.permissionsFor(interaction.guild.members.me!).has("ManageWebhooks")) {
        return void (await interaction.editReply({
          embeds: [
            new EmbedBuilder().setDescription(t("common.errors.NO_PERMS_BOT", { CHANNEL: channel.toString() })).setColor("Red"),
          ],
        }));
      }
      const wb = await client.createWebhook(channel as TextChannel, "For live SkyTimes Update");
      const currentDate = moment().tz(client.timezone);
      const updatedAt = Math.floor(currentDate.valueOf() / 1000);
      const _t = getTranslator((await client.database.getSettings(interaction.guild)).language?.value || "en-US");
      const result = {
        embeds: (await getTimesEmbed(client, _t, _t("times-embed.FOOTER"))).embeds,
      };
      const msg = await wb.send({
        username: "SkyTimes Updates",
        avatarURL: client.user.displayAvatarURL(),
        content: t("shards-embed.CONTENT", { TIME: `<t:${updatedAt}:R>` }),
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
              t("commands.SHARDS_LIVE.RESPONSES.CONFIGURED", {
                CHANNEL: channel.toString(),
                MESSAGE: msg.url,
                TYPE: `"Live SkyTimes"`,
              }),
            )
            .setColor("Green"),
        ],
      });
    } else if (sub === "stop") {
      if (!config.autoTimes.webhook.id || !config.autoTimes.messageId) {
        return void (await interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setDescription(t("commands.SHARDS_LIVE.RESPONSES.ALREADY_DISABLED", { TYPE: `"Live SkyTimes"` }))
              .setColor("Red"),
          ],
        }));
      }

      const wbh = await client
        .fetchWebhook(config.autoTimes.webhook.id, config.autoTimes.webhook.token as unknown as string)
        .catch(() => {});
      if (!wbh) {
        await interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setDescription(t("commands.SHARDS_LIVE.RESPONSES.ALREADY_DISABLED", { TYPE: `"Live SkyTimes"` }))
              .setColor("Red"),
          ],
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
          embeds: [
            new EmbedBuilder()
              .setDescription(t("commands.SHARDS_LIVE.RESPONSES.DISABLED", { TYPE: `"Live SkyTimes"` }))
              .setColor("Red"),
          ],
        });
      } catch (err) {
        client.logger.error("Failed to stop SkyTimes Updates in " + interaction.guild.name, err);
      }
    }
  },
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
    integration_types: [0],
    contexts: [0],
    botPermissions: ["ManageWebhooks"],
    userPermissions: ["ManageGuild"],
  },
  category: "Updates",
} satisfies SlashCommand;
