import('dotenv/config');
import 'module-alias/register';

// register extenders
import '#src/extenders/Client.js';

import cron from 'node-cron';
import chalk from 'chalk';
import { initializeMongoose } from '#src/database/mongoose';
import { validations } from '#handler';
import reminders from '#functions/reminders';
import { SkyHelper } from '#frameworks/index';
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
export default { client };
