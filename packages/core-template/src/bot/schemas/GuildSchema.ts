import mongoose from "mongoose";
import type { APIGuild, APIGuildMember } from "@discordjs/core";
import type { GuildSchema } from "@/types/schemas";
import { LimitedCollection } from "@/utils/LimitedCollection";
const cache = new LimitedCollection<string, GuildSchema>();

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
export { Model as GuildModel };

/**
 * Method to cache all document on restart to reduce load
 */

export const cacheAllGuildDocuments = async () => {
  const data = await Model.find();
  for (const d of data) {
    cache.set(d._id, d);
  }
};

/**
 * Get a guild's settings
 * @param guild Particular guild
 */
export async function getSettings(guild: APIGuild & { clientMember: APIGuildMember }): Promise<GuildSchema> {
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
        region: guild.preferred_locale,
        owner: guild.owner_id,
        joinedAt: new Date(guild.clientMember.joined_at),
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
