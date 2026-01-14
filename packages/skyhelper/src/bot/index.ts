//import "./instrument.js"; // sentry
CustomLogger.log({ level: { name: "Sentry", color: "\x1b[36m" } }, "Sentry Initialized\n\n");

import "./validate-env.js"; // validate env variables
import { GatewayDispatchEvents, GatewayIntentBits, type APIUser, type RESTGetAPIGatewayBotResult } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager, WebSocketShardEvents } from "@discordjs/ws";
import { SkyHelper } from "@/structures";
import handleCachingListeners from "@/handlers/handleCachingListeners";
import { initializeMongoose } from "./schemas/connect.js";
import { Collection } from "@discordjs/collection";
import { CustomLogger } from "./handlers/logger.js";
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
const gateway = new WebSocketManager({
  intents:
    GatewayIntentBits.Guilds |
    GatewayIntentBits.GuildMessages |
    GatewayIntentBits.GuildMembers |
    GatewayIntentBits.MessageContent |
    GatewayIntentBits.DirectMessages |
    GatewayIntentBits.GuildWebhooks,
  token: process.env.TOKEN,
  fetchGatewayInformation: () => rest.get("/gateway/bot") as Promise<RESTGetAPIGatewayBotResult>,
});

console.log("\n\n");

const client = new SkyHelper({ gateway, rest });

// fetch bot user
client.user = (await rest.get("/users/@me")) as APIUser;

client.on(GatewayDispatchEvents.Ready, (packet) => {
  // add to unavailble guilds
  for (const guild of packet.data.guilds) {
    client.unavailableGuilds.add(guild.id);
  }

  if (!client.ready) client.emit("ready", packet);
});

// fetch bot's command
client.applicationCommands = await client.api.applicationCommands
  .getGlobalCommands(client.user.id)
  .then((cmds) => new Collection(cmds.map((c) => [c.id, c])));

// fetch bot's emojis
client.applicationEmojis = await client.api.applications
  .getEmojis(client.user.id)
  .then((cmds) => new Collection(cmds.items.map((c) => [c.id, c])));

await client.loadModules();

// Connect mongoose
await initializeMongoose();
// Attach listeners for updating caches
handleCachingListeners(client);

// update ping
gateway.on(WebSocketShardEvents.HeartbeatComplete, (d) => {
  // only one shard at the moment, so need to worry about rest
  client.ping = d.latency;
});

gateway.connect().catch(client.logger.error);

process.on("unhandledRejection", (err) => {
  client.logger.error("Unhandled: ", err);
});

process.on("uncaughtException", (err) => {
  client.logger.error("Uncaught: ", err);
});
