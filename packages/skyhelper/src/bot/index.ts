import { GatewayDispatchEvents, GatewayIntentBits, type APIUser } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager, WebSocketShardEvents } from "@discordjs/ws";
import { SkyHelper } from "@/structures";
import handleCachingListeners from "@/handlers/handleCachingListeners";
import { initializeMongoose } from "./schemas/connect.js";
import { Collection } from "@discordjs/collection";
import { validateEnv } from "./utils/validators.js";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { CustomLogger } from "./handlers/logger.js";
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN!);
const gateway = new WebSocketManager({
  intents:
    GatewayIntentBits.Guilds |
    GatewayIntentBits.GuildMessages |
    GatewayIntentBits.GuildMembers |
    GatewayIntentBits.MessageContent |
    GatewayIntentBits.DirectMessages |
    GatewayIntentBits.GuildWebhooks,
  token: process.env.TOKEN!,
  rest,
});

validateEnv();
// initialize sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    nodeProfilingIntegration(),
    Sentry.rewriteFramesIntegration({
      root: global.__dirname,
    }),
  ],
  environment: process.env.NODE_ENV,

  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

console.log("\n\n");
CustomLogger.log({ level: { name: "Sentry", color: "\x1b[36m" } }, "Sentry Initialized\n\n\n");

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

gateway.connect();

process.on("unhandledRejection", (err) => {
  client.logger.error("Unhandled: ", err);
});

process.on("uncaughtException", (err) => {
  client.logger.error("Uncaught: ", err);
});
