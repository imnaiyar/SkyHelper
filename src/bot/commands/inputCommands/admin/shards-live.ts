import type { Command } from "#structures";
import { ApplicationCommandOptionType, ChannelType, TextChannel } from "discord.js";
import { useTranslations as x } from "#handlers/useTranslation";
import { handleLive } from "./sub/handle-live.js";
export default {
  async interactionRun(interaction, t) {
    const client = interaction.client;
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.guild) {
      return void (await interaction.followUp(t("commands.SHARDS_LIVE.RESPONSES.NOT_GUILD")));
    }
    const sub = interaction.options.getSubcommand();
    const channel = sub === "start" ? (interaction.options.getChannel("channel", true) as TextChannel) : undefined;
    const config = await client.database.getSettings(interaction.guild);
    try {
      await interaction.editReply(await handleLive(client, "Shards", sub, config, t, channel));
    } catch (err) {
      client.logger.error("Failed to stop Shards Updates in " + interaction.guild.name, err);
    }
  },
  async messageRun({ message, client, t, args }) {
    if (!message.inGuild()) return;
    const sub = args[0];
    const channel = message.mentions.channels.first() || client.channels.cache.get(args[1]);
    if (sub === "start" && (!channel || channel.isDMBased() || channel.guildId !== message.guildId || !channel.isSendable())) {
      return void message.reply(
        "Please provide a valid channel id or mention the channel you want the live shards to be sent to.",
      );
    }

    const config = await client.database.getSettings(message.guild);
    await message.reply(await handleLive(client, "Shards", sub, config, t, channel as TextChannel));
  },
  name: "shards-live",
  description: "auto updating message with live shards details",
  slash: {
    name_localizations: x("commands.SHARDS_LIVE.name"),
    description_localizations: x("commands.SHARDS_LIVE.description"),
    options: [
      {
        name: "start",
        name_localizations: x("commands.SHARDS_LIVE.options.START.name"),
        description: "start live shards",
        description_localizations: x("commands.SHARDS_LIVE.options.START.description"),
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            name_localizations: x("commands.SHARDS_LIVE.options.START.option.CHANNEL.name"),
            description: "channel where shard details should be updated",
            description_localizations: x("commands.SHARDS_LIVE.options.START.option.CHANNEL.description"),
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "stop",
        name_localizations: x("commands.SHARDS_LIVE.options.STOP.name"),
        description: "stop live shard",
        description_localizations: x("commands.SHARDS_LIVE.options.STOP.description"),
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
    integration_types: [0],
    contexts: [0],
  },
  prefix: {
    usage: "<sub> [#channel]",
    minimumArgs: 1,
    subcommands: [
      {
        trigger: "start <#channel>",
        description: "starts live-shards in the given channel",
      },
      {
        trigger: "stop",
        description: "stop live shards",
      },
    ],
  },
  botPermissions: ["ManageWebhooks"],
  userPermissions: ["ManageGuild"],
  category: "Admin",
} satisfies Command;
