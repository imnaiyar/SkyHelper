const { buildShardEmbed } = require('@functions');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
module.exports = {
  shardsUpdate: async (client) => {
    const timezone = 'America/Los_Angeles';
    const currentDate = moment().tz(timezone);
    const updatedAt = Math.floor(currentDate.valueOf() / 1000);
    const { result } = await buildShardEmbed(
      currentDate,
      'Live Shard (updates every 5 min.)',
    );

    const guildData = mongoose.model('autoShard');
   const data = await guildData.find();
      if (data.length === 0) return;
      for (const d of data) {
        if(!d.channelId) continue;
        if(!d.messageId) continue;
        const channel = await client.channels.fetch(d.channelId);
        if (!channel) continue;
        const m = await channel.messages.fetch(d.messageId);
        if (!m) continue;
        if (m.editable) {
              m.edit({
                content: `Last Updated: <t:${updatedAt}:R>`,
                embeds: [result],
              });
            }
      }
  },
};
