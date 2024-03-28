const mongoose = require("mongoose");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: "listlive",
    description: "list all active live shards/skytimes",
    category: "OWNER",
    args: {
      require: true,
      args: ["shards", "times"],
    },
    aliases: ["ll"],
  },
  async execute(msg, args) {
    let model;
    let type;
    if (args[0] === "shards") {
      model = mongoose.model("autoShard");
      type = "Shards";
    } else if (args[0] === "times") {
      model = mongoose.model("autoTimes");
      type = "SkyTimes";
    }
    let description = ``;

    try {
      const data = await model.find();

      if (data.length === 0) {
        return msg.reply(`No active live ${type}`);
      }

      for (const g of data) {
        const guild = msg.client.guilds.cache.get(g._id);

        if (!guild || !guild.name) continue;

        const owner = msg.client.users.cache.get(guild.ownerId);
        const channel = msg.client.channels.cache.get(g.channelId);

        description += `**Guild:** ${guild?.name || "Unknown"} (${guild?.id || "Unknown"})\n**Owner:** ${
          owner?.username || "Unknown"
        } (${owner?.id || "Unknown"})\n**Channel:** ${channel?.name || "Unknown"} (${channel?.id || "Unknown"})\n\n`;
      }

      const embed = new EmbedBuilder().setTitle(`Guilds with active Live ${type}`).setDescription(description);

      msg.reply({
        embeds: [embed],
      });
    } catch (error) {
      console.error(error);
      msg.reply(`An error occurred while fetching live ${type}.`);
    }
  },
};
