const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { nextPrev } = require("./sub/scrollFunc");
const shardInfo = [
  {
    description: "What are shards?",
    image:
      "https://media.discordapp.net/attachments/585339436322259003/998518823231688724/I_watch_you_when_u_sleep_20220718171142.png",
  },
  {
    description: "How do I know when a shard comes?",
    image:
      "https://media.discordapp.net/attachments/585339436322259003/998518823869231164/I_watch_you_when_u_sleep_20220718171208.png",
  },
  {
    description: "What are the rewards?",
    image:
      "https://media.discordapp.net/attachments/585339436322259003/998518824443846696/I_watch_you_when_u_sleep_20220718171215.png",
  },
];
const MAX_SHARD_INDEX = 2;
let currentShardIndex = 0; // Declare currentShardIndex variable.

/**
 * Returns explanation on shards! Shard guide by Art
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {import('discord.js').User} Art
 */
async function shardInfos(interaction, Art) {
  if (interaction.customId === "about") {
    currentShardIndex = 0;
    await showShard(interaction, shardInfo[currentShardIndex], Art);
  } else if (interaction.customId === "about_left") {
    currentShardIndex = Math.max(currentShardIndex - 1, 0);
    await showShard(interaction, shardInfo[currentShardIndex], Art);
  } else if (interaction.customId === "about_right") {
    currentShardIndex = Math.min(currentShardIndex + 1, MAX_SHARD_INDEX);
    await showShard(interaction, shardInfo[currentShardIndex], Art);
  } else if (interaction.customId === "about_original") {
    await nextPrev(interaction);
  }
}

async function showShard(interaction, shard, Art) {
  const avatarURL = Art.avatarURL({ format: "png", size: 2048 });

  const shardEmbed = {
    title: shard.title,
    description: shard.description,
    color: 0x00ff00,
    footer: {
      text: `Page ${currentShardIndex + 1} of ${MAX_SHARD_INDEX + 1} | Sky Shards Information`,
      icon_url: "https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png",
    },
    author: {
      name: `All about shards by Art(${Art.username})`,
      icon_url: `${avatarURL}`,
    },
    image: {
      url: shard.image,
    },
  };

  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setEmoji("<:left:1207594669882613770>").setCustomId("about_left").setStyle("1"),
    new ButtonBuilder().setEmoji("<:right:1207593237544435752>").setCustomId("about_right").setStyle("1"),
    new ButtonBuilder()
      .setEmoji("<:purpleUp:1207632852770881576>")
      .setCustomId("about_original")
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
