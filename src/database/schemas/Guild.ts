import config from "#src/config";
import mongoose from "mongoose";
import FixedSizeMap from "fixedsize-map";
import { Guild } from "discord.js";
import type { GuildSchema } from "#libs";
const cache = new FixedSizeMap<string, GuildSchema>(config.CACHE_SIZE.GUILDS);

const Schema = new mongoose.Schema<GuildSchema>({
  _id: String,

  data: {
    name: String,
    region: String,
    owner: { type: String, ref: "users" },
    joinedAt: Date,
    leftAt: Date,
    bots: { type: Number, default: 0 },
  },
  beta: { type: Boolean, default: null },
  annoucement_channel: { type: String, default: null },
  language: {
    name: String,
    value: String,
    flag: String,
  },
  prefix: String,
  reminders: {
    active: { type: Boolean, default: false },
    default_role: { type: String, default: null },
    dailies: {
      active: { type: Boolean, default: false },
      last_messageId: { type: String, default: null },
      role: { type: String, default: null },
    },
    grandma: {
      active: { type: Boolean, default: false },
      last_messageId: { type: String, default: null },
      role: { type: String, default: null },
    },
    turtle: {
      active: { type: Boolean, default: false },
      last_messageId: { type: String, default: null },
      role: { type: String, default: null },
    },
    eden: {
      active: { type: Boolean, default: false },
      last_messageId: { type: String, default: null },
      role: { type: String, default: null },
    },
    reset: {
      active: { type: Boolean, default: false },
      last_messageId: { type: String, default: null },
      role: { type: String, default: null },
    },
    geyser: {
      active: { type: Boolean, default: false },
      last_messageId: { type: String, default: null },
      role: { type: String, default: null },
    },
    webhook: {
      token: String,
      id: String,
      channelId: String,
    },
  },
  autoShard: {
    active: Boolean,
    messageId: String,
    webhook: {
      id: String,
      token: String,
    },
  },
  autoTimes: {
    active: Boolean,
    messageId: String,
    webhook: {
      id: String,
      token: String,
    },
  },
});

const Model = mongoose.model("guild", Schema);

/**
 * Get a guild's settings
 * @param guild Particular guild
 */
export async function getSettings(guild: Guild): Promise<GuildSchema> {
  if (!guild) throw new Error("Guild is undefined");
  if (!guild.id) throw new Error("Guild Id is undefined");
  const cached = cache.get(guild.id);
  if (cached) return cached;

  let guildData = await Model.findById(guild.id);
  if (!guildData) {
    // save owner details

    // create a new guild model
    guildData = new Model({
      _id: guild.id,
      data: {
        name: guild.name,
        region: guild.preferredLocale,
        owner: guild.ownerId,
        joinedAt: guild.joinedAt,
      },
    });

    await guildData.save();
  }
  cache.add(guild.id, guildData);
  return guildData;
}

/** Returns all guilds with the given active auto updates
 * @param type The type of the event to query for ("shard" | "times")
 * @example
 * await getActiveUpdate("shard")
 */
export async function getActiveUpdates(type: "shard" | "times"): Promise<GuildSchema[]> {
  if (type !== "shard" && type !== "times") throw new Error('Param "type" must be either "shard" or "times"');
  const query = type === "shard" ? { "autoShard.active": true } : { "autoTimes.active": true };
  const activeGuilds = await Model.find(query);
  return activeGuilds;
}

/**
 * Returns all the guilds with active reminders
 */
export async function getActiveReminders(): Promise<GuildSchema[]> {
  return await Model.find({ "reminders.active": true });
}
