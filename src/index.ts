import "dotenv/config";
import { SkyHelper } from "#structures";
import { initializeMongoose } from "#src/database/mongoose";
const client = new SkyHelper();

// Load everything
// Change path if different
await client.loadEvents("src/events");
await client.loadSlashCmd("src/commands/slash");
await client.loadContextCmd("src/commands/contexts");
await client.loadButtons("src/buttons");
await client.loadPrefix("src/commands/prefix");
initializeMongoose();

// Catching unhandle rejections
process.on("unhandledRejection", (err) => client.logger.error(err));
process.on("uncaughtException", (err) => client.logger.error(err));
// Login
client.login(process.env.TOKEN);
