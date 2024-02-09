const moment = require("moment-timezone");
const fs = require("fs");
const buildShardEmbed = require("@handler/buildShardEmbed");

/**
 * Function for the next or previous shard buttons
 * @param {import('discord.js').ButtonInteraction} interaction - the button interaction
 * @param {string} value - value of the button (next or prev)
 */
async function nextPrev(interaction, value) {
  const { client } = interaction;
  const data = client.shardsData.get(interaction.message.id);

  // Increment currentDate by one day
  const currentDate = moment.tz(data.time, "Y-MM-DD", client.timezone).startOf("day");
  let shardDate;
  if (value === "next") {
    shardDate = currentDate.add(1, "day");
  } else if (value === "prev") {
    shardDate = currentDate.subtract(1, "day");
  } else {
    shardDate = currentDate;
  }
  const { result, actionRow } = await buildShardEmbed(shardDate, "SkyHelper");

  await interaction.update({ embeds: [result], components: [actionRow] });
  data.time = shardDate.format();
  client.shardsData.set(interaction.message.id, data);
}

module.exports = { nextPrev };
