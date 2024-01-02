const { buildTimesEmbed, deleteSchema } = require('@functions');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
module.exports = {
  timesUpdate: async (client) => {
    const currentDate = moment().tz(client.timezone);
    const updatedAt = Math.floor(currentDate.valueOf() / 1000);
    const { result } = await buildTimesEmbed(
      client,
      'Live SkyTimes (updates every 2 min.)',
    );

    const guildData = mongoose.model('autoTimes');
    const data = await guildData.find();
    if (data.length === 0) return;

    for (const d of data) {
      if (!d.channelId) continue;
      if (!d.messageId) continue;
      const channel = await client.channels.fetch(d.channelId);
      if (!channel) {
        await deleteSchema('autoTimes', d._id);
        continue;
      }
      const m = await channel.messages.fetch(d.messageId);
      if (!m) {
        await deleteSchema('autoTimes', d._id);
        continue;
      }
      if (m.editable) {
        m.edit({
          content: `Last Updated: <t:${updatedAt}:R>`,
          embeds: [result],
        });
      }
    }
  },
};
