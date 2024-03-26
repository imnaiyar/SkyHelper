const { buildTimesEmbed, deleteSchema } = require("@src/handler");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const { WebhookClient } = require("discord.js");

/**
 * Updates SkyTimes details in all the registered guilds
 * @param {import('@src/frameworks').SkyHelper} client
 */
module.exports = async (client) => {
  const currentDate = moment().tz(client.timezone);
  const updatedAt = Math.floor(currentDate.valueOf() / 1000);
  const { result } = await buildTimesEmbed(client, "Live SkyTimes (updates every 2 min.)");

  const guildData = mongoose.model("autoTimes");
  const data = await guildData.find();
  if (!data) return;

  const dltSChm = (id) => {
    deleteSchema("autoTimes", id);
  };
  data.forEach(async (guild) => {
    if (!guild?.webhook?.id && guild.channelId && guild.messageId ) {
      const ch = client.channels.cache.get(guild.channelId);
      const orgMsg = await ch.messages.fetch(guild.messageId).catch(() => {});
      if (orgMsg) {
        dltSChm(guild._id);
        await orgMsg.edit('Some warning here').catch(() => {});
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
      .editMessage(guild.messageId, { content: `Last Update At: <t:${updatedAt}:R>`, embeds: [result] })
      .catch(async (e) => {
        if (e.message === "Unknown Message") {
          dltSChm(guild._id);
         await webhook.delete().catch(() => client.logger.error(err));
          return;
        }
      });
  });
};
