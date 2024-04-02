require("dotenv").config();
require("module-alias/register");

// register extenders
require("@src/extenders/Client.js");
const cron = require("node-cron");
const chalk = require("chalk");
const { initializeMongoose } = require("@src/database/mongoose");
const { validations } = require("@handler");
const reminders = require("@functions/reminders");
const { SkyHelper } = require("@frameworks/index");
const client = new SkyHelper();

client.logger.log(chalk.blueBright("<----------- Validating Secrets ------------->"));
validations();
client.loadEvents("./src/events");
client.loadSlashCmd("./src/commands");
client.loadButtons("./src/buttons");
client.loadPrefix("./src/commands/prefix");

// unhandled error handling
process.on("unhandledRejection", (err) => client.logger.error(`Unhandled rejection`, err));
process.on("uncaughtException", (err) => client.logger.error(`Uncaught exception`, err));

// setup mongoose
initializeMongoose();

client.on("warn", console.log);

client.login(process.env.TOKEN);
module.exports = { client };
