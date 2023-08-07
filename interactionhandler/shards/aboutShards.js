const { ActionRowBuilder, ButtonBuilder } = require('discord.js');

const shardInfo = [
    { description: 'What are shards?', image: 'https://media.discordapp.net/attachments/585339436322259003/998518823231688724/I_watch_you_when_u_sleep_20220718171142.png' },
    {description: 'How do I know when a shard comes?', image: 'https://media.discordapp.net/attachments/585339436322259003/998518823869231164/I_watch_you_when_u_sleep_20220718171208.png'},
    {description: 'What are the rewards?', image: 'https://media.discordapp.net/attachments/585339436322259003/998518824443846696/I_watch_you_when_u_sleep_20220718171215.png'}
];
const MAX_SHARD_INDEX = 2;
let originalEmbedData = null;
let originalActionRow = null;
let currentShardIndex = 0; // Declare currentShardIndex variable.

async function shardInfos(interaction, Art) {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'about_shard') {
        currentShardIndex = 0;
        originalEmbedData = interaction.message.embeds[0];
        originalActionRow = interaction.message.components?.[0];
        await showShard(interaction, shardInfo[currentShardIndex], Art);
    }else if (interaction.customId === 'left_about') {
        currentShardIndex = Math.max(currentShardIndex - 1, 0);
        await showShard(interaction, shardInfo[currentShardIndex], Art);
    } else if (interaction.customId === 'right_about') {
        currentShardIndex = Math.min(currentShardIndex + 1, MAX_SHARD_INDEX);
        await showShard(interaction, shardInfo[currentShardIndex], Art);
    } else if (interaction.customId === 'original_about') { 
        if (originalEmbedData) {
            await interaction.update({ embeds: [originalEmbedData], components: [originalActionRow] });
        }
    }
}
  
 
async function showShard(interaction, shard, Art) {
    const avatarURL = Art.avatarURL({ format: 'png', size: 2048 });
      
    const shardEmbed = {
        title: shard.title,
        description: shard.description,
        color: 0x00ff00,
        footer: { text: `Page ${currentShardIndex + 1} of ${MAX_SHARD_INDEX + 1} | Sky Shards Information`, icon_url: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' },
        author: {
            name: `All about shards by Art(${Art.username})`,
            url: 'https://example.com',
            icon_url: `${avatarURL}`,
        },
        image: {
            url: shard.image
        },
    };

    const actionRow = new ActionRowBuilder()
        .addComponents(
           new ButtonBuilder()
                .setLabel('⬅️')
                .setCustomId('left_about')
                .setStyle('1'),
            new ButtonBuilder()
                .setLabel('➡️')
                .setCustomId('right_about')
                .setStyle('1'),
            new ButtonBuilder()
                .setLabel('🔙')
                .setCustomId('original_about')
                .setStyle(3) 
                .setDisabled(false),
        );
        
  if (currentShardIndex === 0) {
        actionRow.components[0].setDisabled(true);
    }
    if (currentShardIndex === MAX_SHARD_INDEX) {
        actionRow.components[1].setDisabled(true);
    }
    await interaction.update({ embeds: [shardEmbed], components: [actionRow] });
}

module.exports = {
    shardInfos,
};
