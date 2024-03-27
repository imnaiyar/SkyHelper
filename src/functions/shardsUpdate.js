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
    if (!guild.webhook?.id && guild.channelId && guild.messageId ) {
      const ch = client.channels.cache.get(guild.channelId);
      const orgMsg = await ch.messages.fetch(guild.messageId).catch((err) => {});
      if (orgMsg) {
      await orgMsg.edit({
        embeds: [],
        content: `🔔 Attention:

Hey everyone, bot developer here, I Initially designed the bot with smaller communities in mind, I never expected it to join more than 20 servers let alone this much. However, with expansion comes the need for careful resource management and optimization to ensure optimal performance for all users.

To address these concerns, I am implementing significant changes to enhance efficiency and performance. Specifically, the bot will transition from using channel IDs to utilizing webhooks for Live Updates (Auto Updates). While the previous method was suitable for smaller scales, it could potentially lead to API spam and suboptimal performance at larger scales.

Please note that as a result of this transition, all existing Auto Updates will cease to function until they are reconfigured using </shards-live start:1187023189402996837> </sky-times-live start:1187498083110637662> (Make sure to grant the bot \`Manage Webhooks\` permission beforehand). I apologize for any inconvenience this may cause. There are other major changes made, you can check them all by running </util changelog:1161676078385995786>`
      });
      dltSChm(guild._id);
      }
      return;
      }
    if (!guild?.webhook?.id) return;
    const webhook = await client.fetchWebhook(guild.webhook.id, guild.webhook.token).catch(() => {});
    if (!webhook) {
      dltSChm(guild._id);
      return;
    }
  await webhook
      .editMessage.editMessage(guild.messageId, { content: `Last Update At: <t:${updatedAt}:R>`, embeds: [result] })
      .catch((e) => {
        if (e.message === "Unknown Message") {
          dltSChm(guild._id);
          webhook.delete();
          return;
        }
      });
  });
};
