import type { PrefixCommand } from "#structures";
export default {
  data: {
    name: "register",
    description: "register slash commands",
    aliases: ["r", "rs"],
    ownerOnly: true,
    category: "OWNER",
  },
  async execute({ message, args: _k, client }) {
    const root = process.isBun ? "src" : "dist/src";
    const m = await message.reply("Registering commands...");
    await client.loadSlashCmd(root + "/commands/slash");
    await client.loadContextCmd(root + "/commands/contexts");
    await client.registerCommands();
    await client.application.commands.fetch();
    await m.edit(`Registered ${client.application.commands.cache.size} commands`);
  },
} satisfies PrefixCommand;
