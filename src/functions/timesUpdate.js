const { buildTimesEmbed, deleteSchema } = require("@src/handler");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const { WebhookClient } = require("discord.js");

/**
 * Updates SkyTimes details in all the registered guilds
 * @param {import('@src/structures').SkyHelper} client
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
  for (const guild of data) {
    if (!guild.webhookURL) continue;
    const webhook = new WebhookClient({ url: guild.webhookURL });
    if (!webhook) {
      dltSChm(guild._id);
      continue;
    }
    webhook
      .editMessage(guild.messageId, { content: `Last Update At: <t:${updatedAt}:R>`, embeds: [result] })
      .catch((e) => {
        if (e.message === "Unknown Message") {
          dltSChm(guild._id);
          webhook.delete();
          return;
        }
      });
  }
};
