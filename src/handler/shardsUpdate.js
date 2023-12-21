const { buildShardEmbed } = require('@functions/buildShardEmbed');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
module.exports = {
  shardsUpdate: async (client) => {
    const timezone = 'America/Los_Angeles';
    const currentDate = moment().tz(timezone);
    const updatedAt = Math.floor(currentDate.valueOf() / 1000);
    const { result } = await buildShardEmbed(currentDate, 'Live Shard');

    const guildData = mongoose.model('autoShard');
    await guildData.find().then((data) => {
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
    });
  },
};