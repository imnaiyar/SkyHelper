import type { GuildSchema } from "@/types";
import mongoose from "mongoose";
export const REMINDERS_KEY = ["eden", "ts", "dailies", "concert", "geyser", "grandma", "reset", "turtle"] as const;

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
    events: REMINDERS_KEY.reduce((acc, key) => {
      // @ts-expect-error
      acc[key] = {
        active: { type: Boolean, default: false },
        webhook: {
          id: String,
          token: String,
          channelId: String,
        },
        last_messageId: String,
        role: String,
      };
      return acc;
    }, {}),
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
