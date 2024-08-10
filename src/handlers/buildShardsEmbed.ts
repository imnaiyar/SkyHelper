import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type ColorResolvable, EmbedBuilder, time } from "discord.js";
import moment from "moment-timezone";
import { ShardsUtil as utils, shardsInfo } from "skyhelper-utils";
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
  const today = moment().tz("America/Los_Angeles").startOf("day");
  const formatted = date.isSame(today, "day") ? t("shards-embed.TODAY") : date.format("Do MMMM YYYY");
  const status = utils.getStatus(date);
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
    const isActive = status.find((s) => s.active);
    const allEnded = status.every((s) => s.ended);
    const getIndex = (i: number) => i.toString() + utils.getSuffix(i);
    result
      .addFields(
        { name: t("shards-embed.FIELDS.TYPE.LABEL"), value: `${info.type} (${info.rewards})`, inline: true },
        { name: t("shards-embed.FIELDS.LOCATION.LABEL"), value: `${info.area}`, inline: true },
        {
          name: t("shards-embed.FIELDS.STATUS.LABEL"),
          value: allEnded
            ? t("shards-embed.FIELDS.STATUS.VALUE.ENDED", {
                DURATION: status
                  .slice()
                  .reverse()
                  .find((s) => s.ended)?.duration,
              })
            : isActive
              ? t("shards-embed.FIELDS.STATUS.VALUE.ACTIVE", { INDEX: getIndex(isActive.index), DURATION: isActive.duration })
              : t("shards-embed.FIELDS.STATUS.VALUE.EXPECTED", {
                  INDEX: getIndex(status.find((s) => !s.active && !s.ended)!.index),
                  DURATION: status.find((s) => !s.active && !s.ended)!.duration,
                }),
        },
        {
          name: t("shards-embed.BUTTON1"),
          value: status
            .map((s, i) => {
              const prefix = "- **" + getIndex(i + 1) + " Shard:** ";
              // prettier-ignore
              if (s.ended) return prefix + `~~${time(s.start.unix(), "T")} - ${time(s.end.unix(), "t")} (${t("shards-embed.FIELDS.COUNTDOWN.VALUE.ENDED", { DURATION: s.duration })})~~`;
              // prettier-ignore
              if (s.active) return prefix + `~~${time(s.start.unix(), "T")}~~ - ${time(s.end.unix(), "t")} (${t("shards-embed.FIELDS.COUNTDOWN.VALUE.ACTIVE", { DURATION: s.duration })}) <a:uptime:1228956558113771580>`;
              return (
                prefix +
                `${time(s.start.unix(), "T")} - ${time(s.end.unix(), "t")} (${t("shards-embed.FIELDS.COUNTDOWN.VALUE.EXPECTED", { DURATION: s.duration })})`
              );
            })
            .join("\n"),
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
