
 const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');  
    // Create ActionRow with buttons
    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Timeline')
                .setCustomId('shard_timeline')
                .setStyle('3'),
            new ButtonBuilder()
                .setLabel('Location/Data')
                .setCustomId('shard_location')
                .setStyle('3'),
            new ButtonBuilder()
                .setLabel('About Shard')
                .setCustomId('about_shard')
                .setStyle('3')
        );


module.exports = {actionRow}
