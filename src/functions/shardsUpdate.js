const { buildShardEmbed, deleteSchema } = require("@src/handler");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const { WebhookClient } = require("discord.js");

/**
 * Updates shards details in all the registered guilds
 * @param {import('@src/frameworks').SkyHelper} client
 */
module.exports = async (client) => {
  const timezone = "America/Los_Angeles";
  const currentDate = moment().tz(timezone);
  const updatedAt = Math.floor(currentDate.valueOf() / 1000);
  const { result } = await buildShardEmbed(currentDate, "Live Shard (updates every 5 min.)");

  const guildData = mongoose.model("autoShard");
  const data = await guildData.find();
  if (!data) return;
  const dltSChm = (id) => {
    deleteSchema("autoShard", id);
  };
  data.forEach(async (guild) => {
    if (!guild?.webhook?.id) return;
    const webhook = await client.fetchWebhook(guild.webhook.id, guild.webhook.token).catch(() => {});
    if (!webhook) {
      dltSChm(guild._id);
      return;
    }
  await webhook
      .editMessage(guild.messageId, { content: `Last Update At: <t:${updatedAt}:R>`, embeds: [result] })
      .catch((e) => {
        if (e.message === "Unknown Message") {
          dltSChm(guild._id);
          webhook.delete();
          return;
        }
      });
  });
};
