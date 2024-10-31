import type { Command } from "#structures";
import { TextChannel } from "discord.js";
import { handleLive } from "./sub/handle-live.js";
import { SHARDS_LIVE_DATA } from "#bot/commands/commands-data/admin-commands";
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
  ...SHARDS_LIVE_DATA,
} satisfies Command;
