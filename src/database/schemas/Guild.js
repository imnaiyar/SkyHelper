const { CACHE_SIZE } = require("@root/config.js");
const mongoose = require("mongoose");
const FixedSizeMap = require("fixedsize-map");

const cache = new FixedSizeMap(CACHE_SIZE.GUILDS);

const Schema = new mongoose.Schema({
  _id: String,

  data: {
    name: String,
    region: String,
    owner: { type: String, ref: "users" },
    joinedAt: Date,
    leftAt: Date,
    bots: { type: Number, default: 0 },
  },
  prefix: String,
  skyGPT: String,
  reminders: {
    active: { type: Boolean, default: false},
    default_role: { type: String, default: null },
    dailies: {
      active: { type: Boolean, default: false },
      role: { type: String, default: null },
    },
    grandma: {
      active: { type: Boolean, default: false },
      role: { type: String, default: null },
    },
    turtle: {
      active: { type: Boolean, default: false },
      role: { type: String, default: null },
    },
    eden: {
      active: { type: Boolean, default: false },
      role: { type: String, default: null },
    },
    reset: {
      active: { type: Boolean, default: false },
      role: { type: String, default: null },
    },
    geyser: {
      active: { type: Boolean, default: false },
      role: { type: String, default: null },
    },
    webhook: {
      token: String,
      id: String,
    },
  },
});

const Model = mongoose.model("guild", Schema);

module.exports = {
  /**
   * @param {import('discord.js').Guild} guild
   */
  getSettings: async (guild) => {
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
  },
};
