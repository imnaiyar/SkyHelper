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

    try {
      const data = await model.find();

      if (data.length === 0) {
        return msg.reply('No active live shards');
      }

      for (const g of data) {
        const guild = msg.client.guilds.cache.get(g._id);

        if (!guild || !guild.name) continue;

        const owner = msg.client.users.cache.get(guild.ownerId);
        const channel = msg.client.channels.cache.get(g.channelId);
        
        console.log("Guilds:", guild.name);
        description += `**Guild:** ${guild?.name || "Unknown"} (${guild?.id || "Unknown"})\n**Owner:** ${owner?.username || "Unknown"} (${owner?.id || "Unknown"})\n**Channel:** ${channel.name} (${channel.id})\n\n`;
      }

      const embed = new EmbedBuilder()
        .setTitle('Guilds with active Live Shard')
        .setDescription(description);

      msg.reply({
        embeds: [embed],
      });
    } catch (error) {
      console.error(error);
      msg.reply('An error occurred while fetching live shards.');
    }
  },
};