import { GatewayDispatchEvents, GatewayIntentBits } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import { loadEvents } from "./utils/loaders.js";
import { SkyHelper } from "./structures/Client.js";
import handleCachingListeners from "./handlers/handleCachingListeners.js";
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN!);
const gateway = new WebSocketManager({
  intents: GatewayIntentBits.Guilds,
  token: process.env.TOKEN!,
  rest,
});

const client = new SkyHelper({ gateway, rest });

await loadEvents(client);

// Attach listeners for updating caches
handleCachingListeners(client);

gateway.connect();
