require('dotenv').config();
require('module-alias/register');
const cron = require('node-cron');
const { shardsUpdate } = require('@handler/shardsUpdate');
const { timesUpdate } = require('@handler/timesUpdate');
const { initializeMongoose } = require('@src/database/mongoose');
const { setupPresence } = require('@handler/presence/presence');
const SkyHelper = require('./main');
const client = new SkyHelper();

(async () => {
  await client.validate();
  client.loadEvents('./src/events');
  client.loadSlashCmd('./src/commands');
  client.loadPrefix('./src/commands/prefix');

  // unhandled error handling
  process.on('unhandledRejection', (err) =>
    client.logger.error(`Unhandled rejection`, err),
  );
  process.on('uncaughtException', (err) =>
    client.logger.error(`Uncaught exception`, err),
  );

  // setup mongoose
  initializeMongoose();

  //bots presence
  setupPresence(client);
  // auto shard function
  cron.schedule('*/5 * * * *', async () => {
    try {
      await shardsUpdate(client);
    } catch (err) {
      client.logger.error(err);
    }
  });

  cron.schedule('*/2 * * * *', async () => {
    try {
      await timesUpdate(client);
    } catch (err) {
      client.logger.error(err);
    }
  });

  await client.login(process.env.TOKEN);
})();
module.exports = { client };
