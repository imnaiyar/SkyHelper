const { buildShardEmbed } = require("@handler");
const mongoose = require("mongoose");
const moment = require("moment-timezone");

/**
 * Updates shards details in all the registered guilds
 * @param {import('@src/structures').SkyHelper} client
 */
module.exports = async (client) => {
  const timezone = "America/Los_Angeles";
  const currentDate = moment().tz(timezone);
  const updatedAt = Math.floor(currentDate.valueOf() / 1000);
  const { result } = await buildShardEmbed(currentDate, "Live Shard (updates every 5 min.)");

  const guildData = mongoose.model("autoShard");
  const data = await guildData.find();
  if (!data) return;
  data.forEach((d) => {
    const channel = client.channels.cache.get(d.channelId);
    if (channel) {
      channel.messages.fetch(d.messageId).then((m) => {
        if (m && m.editable) {
          m.edit({
            content: `Last Updated: <t:${updatedAt}:R>`,
            embeds: [result],
          });
        }
      });
    }
  });
};
