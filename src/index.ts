import("dotenv/config");
import { SkyHelper } from "#structures";

const client = new SkyHelper();

// Load everything
// Change path if different
await client.loadEvents("dist/events");
await client.loadSlashCmd("dist/commands");
await client.loadContextCmd("dist/contexts");
await client.loadButtons("dist/buttons");
await client.loadPrefix("dist/prefix");

// Login
client.login(process.env.TOKEN);
