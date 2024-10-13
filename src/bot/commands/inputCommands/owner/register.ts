import { REGISTER_DATA } from "#bot/commands/commands-data/owner-commands";
import type { Command } from "#structures";
export default {
  ...REGISTER_DATA,
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
