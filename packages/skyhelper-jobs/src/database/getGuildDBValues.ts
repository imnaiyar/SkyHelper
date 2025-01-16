import { GuildSchema } from "#src/types.js";
import mongoose from "mongoose";
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
const guildModel = mongoose.model<GuildSchema>("guild", Schema);

/** Returns all guilds with the given active auto updates
 * @param type The type of the event to query for ("shard" | "times")
 * @param force Whether to query directly to database (if `false`, returns from cache if it exists)
 * @example
 * await getActiveUpdate("shard")
 */
export async function getActiveUpdates(type: "shard" | "times"): Promise<GuildSchema[]> {
  if (type !== "shard" && type !== "times") throw new Error('Param "type" must be either "shard" or "times"');
  const query = type === "shard" ? { "autoShard.active": true } : { "autoTimes.active": true };
  const activeGuilds = await guildModel.find(query);
  return activeGuilds;
}

/**
 * Returns all the guilds with active reminders
 */
export async function getActiveReminders(): Promise<GuildSchema[]> {
  return await guildModel.find({ "reminders.active": true });
}
