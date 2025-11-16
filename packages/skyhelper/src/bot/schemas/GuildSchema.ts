import mongoose from "mongoose";
import type { APIGuild, APIGuildMember } from "@discordjs/core";
import type { GuildSchema } from "@/types/schemas";
import { LimitedCollection } from "@/utils/classes/LimitedCollection";
import { REMINDERS_KEY } from "@skyhelperbot/constants";
import config from "@/config";
const cache = new LimitedCollection<string, GuildSchema>({ maxSize: config.CACHE_SIZE.GUILDS });
export { cache as guildSchemaCache };

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
    events: REMINDERS_KEY.reduce<Record<(typeof REMINDERS_KEY)[number], any>>((acc, key) => {
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
      return acc;
    }, {}),
  },
  autoShard: {
    active: Boolean,
    messageId: String,
    webhook: {
      id: String,
      token: String,
      channelId: String,
      threadId: String,
    },
  },
  autoTimes: {
    active: Boolean,
    messageId: String,
    webhook: {
      id: String,
      token: String,
      channelId: String,
      threadId: String,
    },
  },
  isPremium: { type: Boolean, default: false },
});

const Model = mongoose.model("guild", Schema);
export { Model as GuildModel };

/**
 * Get a guild's settings
 * @param guild Particular guild
 */
export async function getSettings(guild: APIGuild & { clientMember: APIGuildMember }): Promise<GuildSchema> {
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
        region: guild.preferred_locale,
        owner: guild.owner_id,
        joinedAt: new Date(guild.clientMember.joined_at!),
      },
    });

    await guildData.save();
  }
  cache.set(guild.id, guildData);
  return guildData;
}

/**
 * Returns all the guilds with active daily quest reminders
 */
export async function getQuestActiveReminders(): Promise<GuildSchema[]> {
  return await Model.find({ "reminders.dailies.active": true });
}

/**
 * Get guilds that has announcement channels setup
 */
export async function getAnnouncementGuilds(): Promise<GuildSchema[]> {
  const data = await Model.find({ annoucement_channel: { $exists: true, $ne: null } });
  return data;
}
