import type { Command } from "#structures";
export default {
  name: "register",
  description: "register slash commands",
  ownerOnly: true,
  category: "OWNER",
  prefix: {
    aliases: ["r", "rs"],
  },
  async messageRun({ message, args: _k, client }) {
    const root = process.isBun ? "src/bot" : "dist/bot";
    const m = await message.reply("Registering commands...");
    await client.loadCommands(root + "/commands/inputCommands");
    await client.loadContextCmd(root + "/commands/contexts");
    await client.registerCommands();
    await client.application.commands.fetch();
    await m.edit(`Registered ${client.application.commands.cache.size} commands`);
  },
} satisfies Command;
