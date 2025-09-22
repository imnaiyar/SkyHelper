import type { GuildSchema } from "@/types";
import mongoose from "mongoose";
import { REMINDERS_KEY } from "@skyhelperbot/constants";

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    events: REMINDERS_KEY.reduce(
      (acc, key) => {
        const schemaObj: any = {
          active: { type: Boolean, default: false },
          webhook: {
            type: new mongoose.Schema(
              {
                id: String,
                token: String,
                channelId: String,
                threadId: String,
              },
              { _id: false },
            ),
            default: null,
            required: false,
          },
          last_messageId: { type: String, default: null },
          role: { type: String, default: null },
          offset: { type: Number, default: 0 },
        };
        if (key === "shards-eruption") {
          schemaObj.shard_type = { type: [String], enum: ["black", "red"], default: ["black", "red"] };
        }
        acc[key] = {
          type: new mongoose.Schema(schemaObj, { _id: false }),
          default: null,
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return acc;
      },

      {} as Record<(typeof REMINDERS_KEY)[number], any>,
    ),
  },

  autoShard: {
    active: Boolean,
    messageId: String,
    webhook: {
      id: String,
      token: String,
      threadId: String,
    },
  },
  autoTimes: {
    active: Boolean,
    messageId: String,
    webhook: {
      id: String,
      token: String,
      threadId: String,
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
