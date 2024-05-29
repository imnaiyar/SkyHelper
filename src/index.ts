import "dotenv/config";
import { SkyHelper } from "#structures";
import { initializeMongoose } from "#src/bot/database/mongoose";
const client = new SkyHelper();
import { Dashboard } from "./dashboard/main.js";
import chalk from "chalk";
// Load everything
// Change path if different
await client.loadEvents("src/bot/events");
await client.loadSlashCmd("src/bot/commands/slash");
await client.loadContextCmd("src/bot/commands/contexts");
await client.loadButtons("src/bot/buttons");
await client.loadPrefix("src/bot/commands/prefix");
await initializeMongoose();
console.log(chalk.blueBright("\n\n<------------------------ Dashboard --------------------------->\n"));
if (client.config.DASHBOARD.enabled) Dashboard();
// Catching unhandle rejections
process.on("unhandledRejection", (err) => client.logger.error(err));
process.on("uncaughtException", (err) => client.logger.error(err));
// Login
client.login(process.env.TOKEN);
