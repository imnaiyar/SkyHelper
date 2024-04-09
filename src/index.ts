import("dotenv/config");
import { SkyHelper } from "#structures";

const client = new SkyHelper();
await client.loadEvents("dist/events");
client.login(process.env.TOKEN);
