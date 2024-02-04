const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const shardsUtil = require("@handler/shardsUtil");
const { nextPrev } = require("./sub/scrollFunc");
const shardData = require("./sub/LocationData");

const MAX_SHARD_INDEX = 1; // Two results for each event, so the max shard index is 1
let currentShardIndex = 0;

/**
 * return location and data for a given shard, with appropriate user credits
 * @param {import('discord.js').ButtonInteraction} interaction 
 * @param {import('discord.js').User} Gale - user object for Clement (for shard location infographic)
 * @param {import('discord.js').User} Clement - user object for Gale (for shard data infographic) 
 */
async function shardLocation(interaction, Gale, Clement) {
  const messageId = interaction.message.id;
  const currentDate = shardsUtil.getMessageDate(interaction, messageId);
  if (!currentDate) return;
  const { currentShard, currentRealm } = shardsUtil.shardsIndex(currentDate);
  if (interaction.customId === "location") {
    currentShardIndex = 0;
    await showShard(interaction, shardData[currentRealm][currentShard][currentShardIndex], Gale, Clement);
  } else if (interaction.customId === "location_leftL") {
    currentShardIndex = Math.max(currentShardIndex - 1, 0);
    await showShard(interaction, shardData[currentRealm][currentShard][currentShardIndex], Gale, Clement);
  } else if (interaction.customId === "location_rightL") {
    currentShardIndex = Math.min(currentShardIndex + 1, MAX_SHARD_INDEX);
    await showShard(interaction, shardData[currentRealm][currentShard][currentShardIndex], Gale, Clement);
  } else if (interaction.customId === "location_originalL") {
    await nextPrev(interaction);
  }
}


/**
 * return location and data for a given shard, with appropriate user credits
 * @param {import('discord.js').ButtonInteraction} interaction 
 * @param {import('./sub/LocationData')} shard 
 * @param {import('discord.js').User} Gale - user object for Clement (for shard location infographic)
 * @param {import('discord.js').User} Clement - user object for Gale (for shard data infographic) 
 */
async function showShard(interaction, shard, Gale, Clement) {
  const clementIcon = Clement.avatarURL({ format: "png", size: 2048 });
  const galeIcon = Gale.avatarURL({ format: "png", size: 2048 });

  // Assuming currentShardIndex and MAX_SHARD_INDEX are defined somewhere in your code

  const authorName =
    currentShardIndex === 0
      ? `Shard location by Clement  (${Clement.username})`
      : `Shard data by Gale (${Gale.username})`;
  const authorIcon = currentShardIndex === 0 ? clementIcon : galeIcon;

  const shardEmbed = {
    title: shard.title,
    description: shard.description,
    color: parseInt("00ff00", 16),
    footer: {
      text: `Page ${currentShardIndex + 1} of ${MAX_SHARD_INDEX + 1} | Sky Shards Information`,
      icon_url: "https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png",
    },
    author: {
      name: authorName,
      icon_url: authorIcon,
    },
    image: {
      url: shard.image,
    },
  };

  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel("Location").setCustomId("location_leftL").setStyle("1"),
    new ButtonBuilder().setLabel("Data").setCustomId("location_rightL").setStyle("1"),
    new ButtonBuilder().setEmoji("<a:back:1148653107773976576>").setCustomId("location_originalL").setStyle(3)
  );

  // Disable navigation buttons if the current shard is the first or last
  if (currentShardIndex === 0) {
    actionRow.components[0].setDisabled(true);
  }
  if (currentShardIndex === MAX_SHARD_INDEX) {
    actionRow.components[1].setDisabled(true);
  }

  await interaction.update({ embeds: [shardEmbed], components: [actionRow] });
}

module.exports = {
  shardLocation,
};
