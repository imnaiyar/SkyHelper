import type { PrefixCommand } from "#bot/structures/PrefixCommands";

export default {
  data: {
    name: "setprefix",
    description: "set the prefix for this server",
    aliases: ["sp"],
    args: {
      minimum: 1,
    },
    userPermissions: ["ManageGuild"],
  },
  async execute({ message: msg, args, client }) {
    if (!msg.inGuild()) return;
    const settings = await client.database.getSettings(msg.guild);
    const prefix = args[0];
    if (!prefix) return void (await msg.reply("You need to provide a prefix to set!"));
    settings.prefix = prefix;
    await settings.save();
    await msg.reply(`Prefix set to \`${prefix}\` for this server`);
  },
} satisfies PrefixCommand;
