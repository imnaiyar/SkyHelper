import type { Command } from "@/structures";
import { handleLive } from "./sub/handleLive.js";
import { LIVE_UPDATES_DATA } from "@/modules/commands-data/admin-commands";
export default {
  async interactionRun({ interaction, t, helper, options }) {
    const client = helper.client;
    await helper.defer({ flags: 64 });
    const guild = client.guilds.get(interaction.guild_id ?? "");
    if (!guild) {
      return void (await helper.editReply({ content: t("commands:LIVE_UPDATES.RESPONSES.NOT_GUILD") }));
    }
    const sub = options.getSubcommand(true);
    const type = options.getString("type", true);
    const channel = sub === "start" ? options.getChannel("channel", true) : undefined;
    const config = await client.schemas.getSettings(guild);
    try {
      await helper.editReply(await handleLive(client, type, sub, config, t, channel));
    } catch (err) {
      client.logger.error("Failed to stop Shards Updates in " + guild.name, err);
    }
  },
  ...LIVE_UPDATES_DATA,
} satisfies Command;
