import { SET_PREFIX_DATA } from "@/modules/commands-data/owner-commands";
import type { Command } from "@/structures";

export default {
  ...SET_PREFIX_DATA,
  async messageRun({ message: msg, args, client }) {
    if (!msg.guild_id) return;
    const guild = client.guilds.get(msg.guild_id);
    if (!guild) throw new Error("Somehow got message from uncached guild");
    const settings = await client.schemas.getSettings(guild);
    const prefix = args[0];
    if (!prefix) {
      await client.api.channels.createMessage(msg.channel_id, {
        content: "You need to provide a prefix to set!",
      });
      return;
    }
    settings.prefix = prefix;
    await settings.save();
    await client.api.channels.createMessage(msg.channel_id, {
      content: `Prefix set to \`${prefix}\` for this server`,
    });
  },
} satisfies Command;
