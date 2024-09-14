import type { Command } from "#structures";

export default {
  name: "setprefix",
  description: "set the prefix for this server",
  prefix: {
    aliases: ["sp"],
    minimumArgs: 1,
    usage: "<prefix>",
  },
  userPermissions: ["ManageGuild"],
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
