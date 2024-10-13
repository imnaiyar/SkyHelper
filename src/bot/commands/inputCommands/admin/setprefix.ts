import { SET_PREFIX_DATA } from "#bot/commands/commands-data/admin-commands";
import type { Command } from "#structures";

export default {
  ...SET_PREFIX_DATA,
  async messageRun({ message: msg, args, client }) {
    if (!msg.inGuild()) return;
    const settings = await client.database.getSettings(msg.guild);
    const prefix = args[0];
    if (!prefix) return void (await msg.reply("You need to provide a prefix to set!"));
    settings.prefix = prefix;
    await settings.save();
    await msg.reply(`Prefix set to \`${prefix}\` for this server`);
  },
} satisfies Command;
