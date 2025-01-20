import { GatewayIntentBits, type APIUser } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import { loadCommands, loadEvents } from "./utils/loaders.js";
import { SkyHelper } from "@/structures/Client";
import handleCachingListeners from "@/handlers/handleCachingListeners";
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN!);
const gateway = new WebSocketManager({
  intents: GatewayIntentBits.Guilds,
  token: process.env.TOKEN!,
  rest,
});

const client = new SkyHelper({ gateway, rest });
client.user = (await rest.get("/users/@me")) as APIUser;
await loadEvents(client);
client.commands = await loadCommands();

// Attach listeners for updating caches
handleCachingListeners(client);

gateway.connect();
