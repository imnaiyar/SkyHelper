require("dotenv").config();
require("module-alias/register");
const cron = require("node-cron");
const { shardsUpdate, timesUpdate } = require("@functions");
const { initializeMongoose } = require("@src/database/mongoose");
const { setupPresence } = require("@handler");
const chalk = require("chalk");
const { SkyHelper } = require("@structures/index");
const client = new SkyHelper();

(async () => {
  await client.validate();
  console.log(chalk.blueBright("<-------------------------- Loading Events --------------------------->"));
  await client.loadEvents("./src/events");
  console.log(chalk.blueBright("<----------------------- Loading Slash Commands ---------------------->"));
  await client.loadSlashCmd("./src/commands");
  console.log(chalk.blueBright("<----------------------- Loading Prefix Commands --------------------->"));
  await client.loadPrefix("./src/commands/prefix");

  // unhandled error handling
  process.on("unhandledRejection", (err) => client.logger.error(`Unhandled rejection`, err));
  process.on("uncaughtException", (err) => client.logger.error(`Uncaught exception`, err));

  // setup mongoose
  initializeMongoose();

  // bots presence
  setupPresence(client);
  // auto shard function
  cron.schedule("*/1 * * * *", async () => {
    try {
      await shardsUpdate(client);
    } catch (err) {
      client.logger.error("AutoShard Error:", err);
    }
  });

  cron.schedule("*/1 * * * *", async () => {
    try {
      await timesUpdate(client);
    } catch (err) {
      client.logger.error("AutoTimes Error:", err);
    }
  });

  await client.login(process.env.TOKEN);
})();
module.exports = { client };
