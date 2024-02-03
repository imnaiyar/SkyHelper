require("module-alias/register");
require("dotenv").config();
const SkyHelper = require("@root/main");
const client = new SkyHelper();
client.loadSlashCmd("./src/commands");

client.on("ready", async () => {
  try {
    client.logger.success("Started refreshing application (/) commands.");

    await client.registerCommands();
    await client.application.commands.fetch();
    client.logger.success(`Registered ${client.application.commands.cache.size} commands`);

    client.logger.success("Successfully reloaded application (/) commands.");
    client.destroy();
  } catch (error) {
    client.logger.error(error);
  }
});
client.login(process.env.TOKEN);
