import "./instrument.js"; // sentry
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

const gatewayInformation = (await rest.get("/gateway/bot")) as RESTGetAPIGatewayBotResult;
const shardCount = resolveShardCount(gatewayInformation.shards);
const shardIds = resolveShardIds(shardCount);

const gateway = new WebSocketManager({
  intents:
    GatewayIntentBits.Guilds |
    GatewayIntentBits.GuildMessages |
    GatewayIntentBits.GuildMembers |
    GatewayIntentBits.MessageContent |
    GatewayIntentBits.DirectMessages |
    GatewayIntentBits.GuildWebhooks,
  token: process.env.TOKEN,
  shardCount,
  shardIds,
  fetchGatewayInformation: () => Promise.resolve(gatewayInformation),
});

console.log("\n\n");

const client = new SkyHelper({ gateway, rest });
client.shardIds = shardIds;

// fetch bot user
client.user = (await rest.get("/users/@me")) as APIUser;

client.on(GatewayDispatchEvents.Ready, (packet) => {
  // add to unavailble guilds
  for (const guild of packet.data.guilds) {
    client.unavailableGuilds.add(guild.id);
  }

  client.readyShards.add(packet.shardId);

  if (!client.ready && client.readyShards.size === client.shardIds.length) {
    client.emit("ready", packet);
  }
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
gateway.on(WebSocketShardEvents.HeartbeatComplete, (d, shardId) => {
  client.shardPings.set(shardId, d.latency);
  const latencies = [...client.shardPings.values()];
  client.ping = latencies.length ? Math.round(latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length) : -1;
});

gateway.connect().catch(client.logger.error);

process.on("unhandledRejection", (err) => {
  client.logger.error("Unhandled: ", err);
});

process.on("uncaughtException", (err) => {
  client.logger.error("Uncaught: ", err);
});

function resolveShardCount(recommendedCount: number) {
  const raw = process.env.SHARD_COUNT;
  if (!raw) return recommendedCount;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid SHARD_COUNT value "${raw}". It must be a positive integer.`);
  }

  return parsed;
}

function resolveShardIds(totalShardCount: number) {
  const raw = process.env.SHARD_IDS;
  if (!raw) return Array.from({ length: totalShardCount }, (_, index) => index);

  const parsedShardIds = raw
    .split(",")
    .map((segment) => Number(segment.trim()))
    .filter((segment) => !Number.isNaN(segment));

  if (parsedShardIds.length === 0) {
    throw new Error(`Invalid SHARD_IDS value "${raw}". It must contain at least one shard id.`);
  }

  const uniqueShardIds = [...new Set(parsedShardIds)];
  const invalidShardId = uniqueShardIds.find((id) => !Number.isInteger(id) || id < 0 || id >= totalShardCount);
  if (invalidShardId !== undefined) {
    throw new Error(`Invalid shard id "${invalidShardId}" in SHARD_IDS. Expected values between 0 and ${totalShardCount - 1}.`);
  }

  return uniqueShardIds.sort((a, b) => a - b);
}
