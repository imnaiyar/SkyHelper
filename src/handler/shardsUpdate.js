const { shardsReply } = require('@shards/sub/shardsReply');
const { EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
module.exports = {
  shardsUpdate: async (client) => {
    const timezone = 'America/Los_Angeles';
    const currentDate = moment().tz(timezone);
    const updatedAt = Math.floor(currentDate.valueOf() / 1000);
    const {
      type,
      location,
      rewards,
      colors,
      showButtons,
      thumbUrl,
      noShard,
      eventStatus,
      timeRemaining,
      currentEvent,
      currentSecondEvent,
      dayOfWeek,
    } = await shardsReply(currentDate);
    let result = new EmbedBuilder()
      .setAuthor({
        name: `Shards Info`,
        iconURL:
          'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925',
      })
      .setTitle(`${noShard}`)
      .setTimestamp(Date.now())
      .setFooter({
        text: 'Live Shard',
        iconURL: client.user.displayAvatarURL(),
      });
    let disabled;
    if (showButtons) {
      result
        .addFields(
          { name: `Shard Type`, value: `${type} (${rewards})`, inline: true },
          { name: 'Location', value: `${location}`, inline: true },
          { name: 'Status', value: `${eventStatus}` },
          { name: 'Countdown', value: `${timeRemaining}`, inline: true },
        )
        .setColor(colors)
        .setThumbnail(thumbUrl);
      disabled = false;
    } else {
      result
        .setImage(
          'https://media.discordapp.net/attachments/867638574571323424/1155727524911923220/5F1548AC-C7DD-4127-AF6F-0BC388-unscreen.gif',
        )
        .setDescription(`**It's a no shard day.**`)
        .setColor('#9fb686');

      disabled = true;
    }

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
