const { shardsReply } = require("@functions/shards/sub/shardsReply");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const config = require("@root/config");

/**
 *
 * @param {Date} currentDate
 * @param {string} footer
 * @returns {object} result, actionRow
 */
module.exports = async (currentDate, footer) => {
  const { type, location, rewards, colors, showButtons, thumbUrl, noShard, eventStatus, timeRemaining } =
    await shardsReply(currentDate);
  let result = new EmbedBuilder()
    .setAuthor({
      name: `Shards Info`,
      iconURL:
        "https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925",
    })
    .setTitle(`${noShard}`)
    .setTimestamp(Date.now())
    .setFooter({
      text: footer,
      iconURL: config.BOT_ICON,
    });
  let disabled;
  if (showButtons) {
    result
      .addFields(
        { name: `Shard Type`, value: `${type} (${rewards})`, inline: true },
        { name: "Location", value: `${location}`, inline: true },
        { name: "Status", value: `${eventStatus}` },
        { name: "Countdown", value: `${timeRemaining}`, inline: true }
      )
      .setColor(colors)
      .setThumbnail(thumbUrl);
    disabled = false;
  } else {
    result
      .setImage("https://media.discordapp.net/attachments/867638574571323424/1193308709183553617/20240107_0342171.gif")
      .setDescription(`**It's a no shard day.**`)
      .setColor("#9fb686");

    disabled = true;
  }
  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setEmoji("<a:left:1148644073670975640>").setCustomId("prev").setStyle("1"),
    new ButtonBuilder().setEmoji("<a:right:1148627450608222278>").setCustomId("next").setStyle("1"),
    new ButtonBuilder().setLabel("Timeline").setCustomId("timeline").setDisabled(disabled).setStyle("3"),
    new ButtonBuilder().setLabel("Location/Data").setCustomId("location").setDisabled(disabled).setStyle("3"),
    new ButtonBuilder().setLabel("About Shard").setCustomId("about").setStyle("3")
  );
  return { result, actionRow };
};
