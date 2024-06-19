import { shardsInfo } from "#libs/constants/index";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type ColorResolvable, EmbedBuilder, time } from "discord.js";
import moment from "moment-timezone";
import { ShardsUtil as utils } from "skyhelper-utils";
import getCountdown from "#handlers/getShardStatus";
import type { getTranslator } from "#src/i18n";
/**
 * @param date The date for which the shards embed is to be built
 * @param footer The footer text for the embed
 * @param noBtn Whether to add buttons or not (for Scroll Buttons in Live Updates)
 */
export default (
  date: moment.Moment,
  t: ReturnType<typeof getTranslator>,
  footer: string,
  noBtn?: boolean,
): {
  embeds: EmbedBuilder[];
  components: ActionRowBuilder<ButtonBuilder>[];
} => {
  const { currentShard, currentRealm } = utils.shardsIndex(date);
  const info = shardsInfo[currentRealm][currentShard];
  const buttonsToAdd: ButtonBuilder[] = [];
  const today = moment().tz("America/Los_Angeles").startOf("day");
  const formatted = date.isSame(today, "day") ? t("shards-embed.TODAY") : date.format("Do MMMM YYYY");
  const status = getCountdown(date);
  const result = new EmbedBuilder()
    .setAuthor({
      name: t("shards-embed.AUTHOR"),
      iconURL:
        "https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925",
    })
    .setTitle(`${formatted}`)
    .setTimestamp(Date.now())
    .setFooter({
      text: footer,
      iconURL: "https://cdn.imnaiyar.site/bot-icon.gif",
    });
  let navBtns = null;
  if (!noBtn) {
    navBtns = new ActionRowBuilder<ButtonBuilder>().addComponents(
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
      .setLabel(t("shards-embed.BUTTON1"))
      .setCustomId(`shards-timeline_${date.format("YYYY-MM-DD")}`)
      .setDisabled(status === "No Shard")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setLabel(t("shards-embed.BUTTON2"))
      .setCustomId(`shards-location_${date.format("YYYY-MM-DD")}`)
      .setDisabled(status === "No Shard")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder().setLabel(t("shards-embed.BUTTON3")).setCustomId("shards-about").setStyle(ButtonStyle.Success),
  );
  if (status === "No Shard") {
    result
      .setImage("https://media.discordapp.net/attachments/867638574571323424/1193308709183553617/20240107_0342171.gif")
      .setDescription(`**${t("shards-embed.NO-SHARD")}**`)
      .setColor("#9fb686");
  } else {
    const index = status.index?.toString() + utils.getSuffix(status.index as number);
    result
      .addFields(
        { name: t("shards-embed.FIELDS.TYPE.LABEL"), value: `${info.type} (${info.rewards})`, inline: true },
        { name: t("shards-embed.FIELDS.LOCATION.LABEL"), value: `${info.area}`, inline: true },
        {
          name: t("shards-embed.FIELDS.STATUS.LABEL"),
          value: status.ended
            ? t("shards-embed.FIELDS.STATUS.VALUE.ENDED")
            : status.active
              ? t("shards-embed.FIELDS.STATUS.VALUE.ACTIVE", { INDEX: index })
              : t("shards-embed.FIELDS.STATUS.VALUE.EXPECTED", { INDEX: index }),
        },
        {
          name: t("shards-embed.FIELDS.COUNTDOWN.LABEL"),
          value: status.ended
            ? t("shards-embed.FIELDS.COUNTDOWN.VALUE.ENDED", {
                DURATION: status.duration,
                TIME: time(status.end.unix(), "t"),
              })
            : status.active
              ? t("shards-embed.FIELDS.COUNTDOWN.VALUE.ENDED", {
                  DURATION: status.duration,
                  TIME: time(status.end.unix(), "t"),
                })
              : t("shards-embed.FIELDS.COUNTDOWN.VALUE.EXPECTED", {
                  DURATION: status.duration,
                  TIME: time(status.start.unix(), "T"),
                }),
          inline: true,
        },
      )
      .setColor(info.colors as ColorResolvable)
      .setThumbnail(info.image);
  }
  return {
    embeds: [result],
    components: navBtns ? [actionRow, navBtns] : [actionRow],
  };
};
