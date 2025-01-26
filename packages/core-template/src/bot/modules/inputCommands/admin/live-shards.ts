import type { Command } from "@/structures";
import { handleLive } from "./sub/handleLive.js";
import { SHARDS_LIVE_DATA } from "@/modules/commands-data/admin-commands";
import type { APITextChannel } from "@discordjs/core";
export default {
  async interactionRun({ interaction, t, helper, options }) {
    const client = helper.client;
    await helper.defer({ flags: 64 });
    const guild = client.guilds.get(interaction.guild_id || "");
    if (!guild) {
      return void (await helper.editReply({ content: t("commands:SHARDS_LIVE.RESPONSES.NOT_GUILD") }));
    }
    const sub = options.getSubcommand(true);
    const channel = sub === "start" ? (options.getChannel("channel", true) as unknown as APITextChannel) : undefined;
    const config = await client.schemas.getSettings(guild);
    try {
      await helper.editReply(await handleLive(client, "Shards", sub, config, t, channel));
    } catch (err) {
      client.logger.error("Failed to stop Shards Updates in " + guild.name, err);
    }
  },
  ...SHARDS_LIVE_DATA,
} satisfies Command;
