await import("dotenv/config");
import { SkyHelper } from "#structures";
const client = new SkyHelper();

client.on("ready", async () => {
  try {
    client.logger.success("Started refreshing application (/) commands.");
    await client.loadSlashCmd("dist/commands/slash");
    await client.loadContextCmd("dist/commands/contexts");
    await client.registerCommands();
    await client.application.commands.fetch();
    client.logger.success(`Registered ${client.application.commands.cache.size} commands`);

    client.logger.success("Successfully reloaded application (/) commands.");
    client.destroy();
  } catch (error) {
    client.logger.error(error);
    client.destroy();
  }
});
client.login(process.env.TOKEN);
