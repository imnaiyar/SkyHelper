const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  _id: String,
  name: String,
  channelId: String,
  messageId: String,
  webhookURL: String,
});

const Model = mongoose.model("autoTimes", Schema);

module.exports = {
  autoTimes: async (guild) => {
    if (!guild) throw new Error("Guild is undefined");
    if (!guild.id) throw new Error("Guild Id is undefined");

    let guildData = await Model.findById(guild.id);
    if (!guildData) {
      guildData = new Model({
        _id: guild.id,
        name: guild.name,
      });

      await guildData.save();
    }
    return guildData;
  },
};
