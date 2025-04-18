import { ShardsUtil as utils, shardsInfo } from "@skyhelperbot/utils";
import type { getTranslator } from "@/functions/getTranslator.js";
import { DateTime } from "luxon";
import {
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIEmbed,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { resolveColor } from "@/utils/resolveColor.js";
/**
 * @param date The date for which the shards embed is to be built
 * @param footer The footer text for the embed
 */
export default (
  date: DateTime,
  t: ReturnType<typeof getTranslator>,
  footer: string,
): {
  embeds: APIEmbed[];
  components: APIActionRowComponent<APIButtonComponent>[];
} => {
  const { currentShard, currentRealm } = utils.shardsIndex(date);
  const info = shardsInfo[currentRealm][currentShard];
  const today = DateTime.now().setZone("America/Los_Angeles").startOf("day");
  const formatted = date.hasSame(today, "day") ? t("features:shards-embed.TODAY") : date.toFormat("dd MMMM yyyy");
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

  const actionRow: APIActionRowComponent<APIButtonComponent> = {
    type: ComponentType.ActionRow,
    components: [
      {
        type: ComponentType.Button,
        label: t("features:shards-embed.BUTTON1"),
        custom_id: `shards-timeline;date:${date.toISODate()}`,
        disabled: status === "No Shard",
        style: ButtonStyle.Success,
      },
      {
        type: ComponentType.Button,
        label: t("features:shards-embed.BUTTON2"),
        custom_id: `shards-location;date:${date.toISODate()}`,
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
              if (s.ended) return prefix + `~~<t:${s.start.toUnixInteger()}:T> - <t:${s.end.toUnixInteger()}:t> (${t("features:shards-embed.FIELDS.COUNTDOWN.VALUE.ENDED", { DURATION: s.duration })})~~`;
              // prettier-ignore
              if (s.active) return prefix + `~~<t:${s.start.toUnixInteger()}:T>~~ - <t:${s.end.toUnixInteger()}:t> (${t("features:shards-embed.FIELDS.COUNTDOWN.VALUE.ACTIVE", { DURATION: s.duration })}) <a:uptime:1228956558113771580>`;
              return (
                prefix +
                `<t:${s.start.toUnixInteger()}:T> - <t:${s.end.toUnixInteger()}:t> (${t("features:shards-embed.FIELDS.COUNTDOWN.VALUE.EXPECTED", { DURATION: s.duration })})`
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
    components: [actionRow],
  };
};
