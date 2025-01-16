import moment from "moment-timezone";
import { ShardsUtil as utils, shardsInfo } from "skyhelper-utils";
import type { getTranslator } from "#src/functions/getTranslator.js";
import { APIActionRowComponent, APIButtonComponent, APIEmbed, ButtonStyle, ComponentType } from "discord-api-types/v10";
import { resolveColor } from "#src/utils/resolveColor.js";
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
  embeds: APIEmbed[];
  components: APIActionRowComponent<APIButtonComponent>[];
} => {
  const { currentShard, currentRealm } = utils.shardsIndex(date);
  const info = shardsInfo[currentRealm][currentShard];
  const today = moment().tz("America/Los_Angeles").startOf("day");
  const formatted = date.isSame(today, "day") ? t("features:shards-embed.TODAY") : date.format("Do MMMM YYYY");
  const status = utils.getStatus(date);
  let result: APIEmbed = {
    author: {
      name: t("features:shards-embed.AUTHOR"),
      icon_url:
        "https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925",
    },
    title: formatted,
    timestamp: new Date().toISOString(),
    footer: { text: footer, icon_url: "https://skyhelper.xyz/assets/img/boticon.png" },
  };
  const navBtns: APIActionRowComponent<APIButtonComponent> | null = noBtn
    ? null
    : {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            emoji: { name: "left", id: "1207594669882613770" },
            custom_id: `shards-scroll_${date.clone().subtract(1, "day").format("YYYY-MM-DD")}`,
            style: ButtonStyle.Primary,
          },
          {
            type: ComponentType.Button,
            emoji: { name: "right", id: "1207593237544435752" },
            custom_id: `shards-scroll_${date.clone().add(1, "day").format("YYYY-MM-DD")}`,
            style: ButtonStyle.Primary,
          },
        ],
      };

  const actionRow: APIActionRowComponent<APIButtonComponent> = {
    type: ComponentType.ActionRow,
    components: [
      {
        type: ComponentType.Button,
        label: t("features:shards-embed.BUTTON1"),
        custom_id: `shards-timeline_${date.format("YYYY-MM-DD")}`,
        disabled: status === "No Shard",
        style: ButtonStyle.Success,
      },
      {
        type: ComponentType.Button,
        label: t("features:shards-embed.BUTTON2"),
        custom_id: `shards-location_${date.format("YYYY-MM-DD")}`,
        disabled: status === "No Shard",
        style: ButtonStyle.Success,
      },
      {
        type: ComponentType.Button,
        label: t("features:shards-embed.BUTTON3"),
        custom_id: "shards-about",
        style: ButtonStyle.Success,
      },
    ],
  };
  if (status === "No Shard") {
    result = {
      ...result,
      image: { url: "https://media.discordapp.net/attachments/867638574571323424/1193308709183553617/20240107_0342171.gif" },
      description: `**${t("features:shards-embed.NO-SHARD")}**`,
      color: resolveColor("#9fb686"),
    };
  } else {
    const isActive = status.find((s) => s.active);
    const allEnded = status.every((s) => s.ended);
    const getIndex = (i: number) => i.toString() + utils.getSuffix(i);
    result = {
      ...result,
      fields: [
        { name: t("features:shards-embed.FIELDS.TYPE.LABEL"), value: `${info.type} (${info.rewards})`, inline: true },
        { name: t("features:shards-embed.FIELDS.LOCATION.LABEL"), value: `${info.area}`, inline: true },
        {
          name: t("features:shards-embed.FIELDS.STATUS.LABEL"),
          value: allEnded
            ? t("features:shards-embed.FIELDS.STATUS.VALUE.ENDED", {
                DURATION: status
                  .slice()
                  .reverse()
                  .find((s) => s.ended)?.duration,
              })
            : isActive
              ? t("features:shards-embed.FIELDS.STATUS.VALUE.ACTIVE", {
                  INDEX: getIndex(isActive.index),
                  DURATION: isActive.duration,
                })
              : t("features:shards-embed.FIELDS.STATUS.VALUE.EXPECTED", {
                  INDEX: getIndex(status.find((s) => !s.active && !s.ended)!.index),
                  DURATION: status.find((s) => !s.active && !s.ended)!.duration,
                }),
        },
        {
          name: t("features:shards-embed.BUTTON1"),
          value: status
            .map((s, i) => {
              const prefix = "- **" + getIndex(i + 1) + " Shard:** ";
              // prettier-ignore
              if (s.ended) return prefix + `~~<t:${s.start.unix()}:T> - <t:${s.end.unix()}:t> (${t("features:shards-embed.FIELDS.COUNTDOWN.VALUE.ENDED", { DURATION: s.duration })})~~`;
              // prettier-ignore
              if (s.active) return prefix + `~~<t:${s.start.unix()}:T>~~ - <t:${s.end.unix()}:t> (${t("features:shards-embed.FIELDS.COUNTDOWN.VALUE.ACTIVE", { DURATION: s.duration })}) <a:uptime:1228956558113771580>`;
              return (
                prefix +
                `<t:${s.start.unix()}:T> - <t:${s.end.unix()}:t> (${t("features:shards-embed.FIELDS.COUNTDOWN.VALUE.EXPECTED", { DURATION: s.duration })})`
              );
            })
            .join("\n"),
          inline: true,
        },
      ],
      thumbnail: { url: info.image },
      color: resolveColor(info.colors),
    };
  }

  return {
    embeds: [result],
    components: navBtns ? [actionRow, navBtns] : [actionRow],
  };
};
