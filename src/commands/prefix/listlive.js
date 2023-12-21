const mongoose = require('mongoose');
const { EmbedBuilder } = require('discord.js');
module.exports = {
  data: {
    name: 'listlive',
    description: 'list all active live shards',
    category: 'OWNER',
  },
  async execute(msg, args) {
    const model = mongoose.model('autoShard');
    let description = ``;
    await model.find().then((data) => {
      if (data.length === 0) {
        return msg.reply('No active live shards');
      }
      data.forEach((g) => {
        const guild = msg.client.guilds.cache.get(g._id);
        const owner = msg.client.users.cache.get(guild.ownerId);
        const channel = msg.client.channels.cache.get(g.channelId);
        description += `**Guild:** ${guild.name} (${guild.id})\n**Owner:** ${owner?.username || "Unknown"} (${owner?.id || "Unknown"})\n**Channel:** ${channel.name} (${channel.id})\n\n`;
      });
      const embed = new EmbedBuilder()
        .setTitle('Guilds with active Live Shard')
        .setDescription(description);
      msg.reply({
        embeds: [embed],
      });
    });
  },
};
