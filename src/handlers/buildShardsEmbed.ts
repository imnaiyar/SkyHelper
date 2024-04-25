import shardsInfo from "#libs/constants/shardsInfo";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ColorResolvable, EmbedBuilder, time } from "discord.js";
import moment from "moment-timezone";
import { ShardsUtil as utils } from "skyhelper-utils";
import getCountdown from "#handlers/getShardStatus";
/**
 * @param date The date for which the shards embed is to be built
 * @param footer The footer text for the embed
 * @param noBtn Whether to add buttons or not (for Scroll Buttons in Live Updates)
 */
export default (
  date: moment.Moment,
  footer: string,
  noBtn?: boolean,
): {
  result: EmbedBuilder;
  actionRow: ActionRowBuilder<ButtonBuilder>;
} => {
  const { currentShard, currentRealm } = utils.shardsIndex(date);
  const info = shardsInfo[currentRealm][currentShard];
  const buttonsToAdd: ButtonBuilder[] = [];
  const today = moment().tz("America/Los_Angeles").startOf("day");
  const formatted = date.isSame(today, "day") ? "Today" : date.format("Do MMMM YYYY");
  const status = getCountdown(date);
  const result = new EmbedBuilder()
    .setAuthor({
      name: `Shards Info`,
      iconURL:
        "https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925",
    })
    .setTitle(`${formatted}`)
    .setTimestamp(Date.now())
    .setFooter({
      text: footer,
      iconURL: "https://cdn.imnaiyar.site/bot-icon.gif",
    });

  if (!noBtn) {
    buttonsToAdd.push(
      new ButtonBuilder()
        .setEmoji("<:left:1207594669882613770>")
        .setCustomId(`shards-scroll_${date.clone().subtract(1, "day").format("YYYY-MM-DD")}`)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setEmoji("<:right:1207593237544435752>")
        .setCustomId(`shards-scroll_${date.clone().add(1, "day").format("YYYY-MM-DD")}`)
        .setStyle(ButtonStyle.Primary),
    );
  }
  const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    ...buttonsToAdd,
    new ButtonBuilder()
      .setLabel("Timeline")
      .setCustomId(`shards-timeline_${date.format("YYYY-MM-DD")}`)
      .setDisabled(status === "No Shard")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setLabel("Location/Data")
      .setCustomId(`shards-location_${date.format("YYYY-MM-DD")}`)
      .setDisabled(status === "No Shard")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder().setLabel("About Shard").setCustomId("shards-about").setStyle(ButtonStyle.Success),
  );
  if (status === "No Shard") {
    result
      .setImage("https://media.discordapp.net/attachments/867638574571323424/1193308709183553617/20240107_0342171.gif")
      .setDescription(`**It's a no shard day.**`)
      .setColor("#9fb686");
  } else {
    const index = status.index?.toString() + utils.getSuffix(status.index as number);
    result
      .addFields(
        { name: `Shard Type`, value: `${info.type} (${info.rewards})`, inline: true },
        { name: "Location", value: `${info.area}`, inline: true },
        {
          name: "Status",
          value: status.ended
            ? "All Shards Ended"
            : status.active
              ? `${index} shard is currently active`
              : `${index} shard has not fallen yet`,
        },
        {
          name: "Countdown",
          value: status.ended
            ? `${status.duration} ago (at ${time(status.end.unix(), "t")})`
            : status.active
              ? `Ends in ${status.duration} (at ${time(status.end.unix(), "t")})`
              : `Falls in ${status.duration} (at ${time(status.start.unix(), "T")})`,
          inline: true,
        },
      )
      .setColor(info.colors as ColorResolvable)
      .setThumbnail(info.image);
  }
  return {
    result,
    actionRow,
  };
};
