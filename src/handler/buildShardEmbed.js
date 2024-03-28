const { shardsReply } = require("@functions/shards/sub/shardsReply");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const config = require("@root/config");

/**
 * Builds Guve Shards embed
 * @param {Date} givenDate
 * @param {string} footer
 * @returns {object} result, actionRow
 */
module.exports = (givenDate, footer, noBtn) => {
  const { type, location, rewards, colors, showButtons, thumbUrl, noShard, eventStatus, timeRemaining } =
    shardsReply(givenDate);
  const result = new EmbedBuilder()
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
        { name: "Countdown", value: `${timeRemaining}`, inline: true },
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

  const prevDate = givenDate.clone().subtract(1, "day").format("YYYY-MM-DD");
  const nextDate = givenDate.clone().add(1, "day").format("YYYY-MM-DD");
  const buttonsToAdd = [];
  if (!noBtn) {
    buttonsToAdd.push(
      new ButtonBuilder()
        .setEmoji("<:left:1207594669882613770>")
        .setCustomId(`shards-scroll_${prevDate}`)
        .setStyle("1"),
      new ButtonBuilder()
        .setEmoji("<:right:1207593237544435752>")
        .setCustomId(`shards-scroll_${nextDate}`)
        .setStyle("1"),
    );
  }

  const actionRow = new ActionRowBuilder().addComponents(
    ...buttonsToAdd,
    new ButtonBuilder()
      .setLabel("Timeline")
      .setCustomId(`shards-timeline_${givenDate.format("YYYY-MM-DD")}`)
      .setDisabled(disabled)
      .setStyle("3"),
    new ButtonBuilder()
      .setLabel("Location/Data")
      .setCustomId(`shards-location_${givenDate.format("YYYY-MM-DD")}`)
      .setDisabled(disabled)
      .setStyle("3"),
    new ButtonBuilder().setLabel("About Shard").setCustomId("shards-about").setStyle("3"),
  );
  return { result, actionRow };
};
