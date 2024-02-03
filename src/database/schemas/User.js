const mongoose = require("mongoose");
const { CACHE_SIZE } = require("@root/config.js");
const FixedSizeMap = require("fixedsize-map");

const cache = new FixedSizeMap(CACHE_SIZE.USERS);
const Schema = new mongoose.Schema({
  _id: String,
  data: {
    username: String,
    createdAt: Date,
  },
  isBlacklisted: Boolean,
});

const Model = mongoose.model("users", Schema);

module.exports = {
  getUser: async (user) => {
    if (!user) throw new Error("User is undefined");
    if (!user.id) throw new Error("User Id is undefined");

    const cached = cache.get(user.id);
    if (cached) return cached;

    let userData = await Model.findById(user.id);
    if (!userData) {
      // create a new guild model
      userData = new Model({
        _id: user.id,
        data: {
          username: user.username,
          createdAt: user.createdAt,
        },
      });

      await userData.save();
    }
    cache.add(user.id, userData);
    return userData;
  },
  getAll: async () => {},
};
