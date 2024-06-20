import "dotenv/config";
import { SkyHelper } from "#structures";
import { initializeMongoose } from "#src/database/mongoose";
const client = new SkyHelper();
import { Dashboard } from "../dashboard/main.js";
import chalk from "chalk";
// Load everything
// Change path if different

declare global {
  namespace NodeJS {
    interface Process {
      isBun?: boolean;
    }
  }
}

const root = process.isBun ? "src" : "dist/src";
await client.loadEvents(root + "/events");
await client.loadSlashCmd(root + "/commands/slash");
await client.loadContextCmd(root + "/commands/contexts");
await client.loadButtons(root + "/buttons");
await client.loadPrefix(root + "/commands/prefix");
await initializeMongoose();
console.log(chalk.blueBright("\n\n<------------------------ Dashboard --------------------------->\n"));
if (client.config.DASHBOARD.enabled) Dashboard(client);
// Catching unhandle rejections
process.on("unhandledRejection", (err) => client.logger.error(err));
process.on("uncaughtException", (err) => client.logger.error(err));
// Login
client.login(process.env.TOKEN);
