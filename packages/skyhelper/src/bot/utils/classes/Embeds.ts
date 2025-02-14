import { ShardsUtil as utils, shardsInfo, resolveColor, type ColorResolvable } from "@skyhelperbot/utils";
import {
  ButtonStyle,
  ComponentType,
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIEmbed,
  type APIStringSelectComponent,
} from "@discordjs/core";
import { DateTime } from "luxon";
import Utils from "./Utils.js";
import type { SpiritsData } from "@skyhelperbot/constants/spirits-datas";
import { getSpecialEvent, getTSData } from "../getEventDatas.js";
import type { getTranslator } from "@/i18n";
import { eventData, SkytimesUtils as skyutils } from "@skyhelperbot/utils";
import type { SkyHelper } from "@/structures/Client";
import type { DailyQuestsSchema } from "@/types/schemas";

export default class {
  /**
   * @param date The date for which the shards embed is to be built
   * @param footer The footer text for the embed
   * @param noBtn Whether to add buttons or not (for Scroll Buttons in Live Updates)
   */
  static buildShardEmbed(
    date: DateTime,
    t: ReturnType<typeof import("@/i18n").getTranslator>,
    footer: string,
    noBtn?: boolean,
    user?: string,
  ): {
    embeds: APIEmbed[];
    components: APIActionRowComponent<APIButtonComponent>[];
  } {
    const { currentShard, currentRealm } = utils.shardsIndex(date);
    const info = shardsInfo[currentRealm][currentShard];
    const today = DateTime.now().setZone("America/Los_Angeles").startOf("day");
    const formatted = date.hasSame(today, "day") ? t("features:shards-embed.TODAY") : date.toFormat("dd MMMM yyyy");
    const status = utils.getStatus(date);
    const result: APIEmbed = {
      author: {
        name: t("features:shards-embed.AUTHOR"),
        icon_url:
          "https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925",
      },
      title: formatted,
      timestamp: new Date().toISOString(),
      footer: {
        text: footer,
        icon_url: "https://cdn.imnaiyar.site/bot-icon.gif",
      },
    };

    // TODO: Use encode id to include the date (and maybe user to), also would need to update jobs
    let navBtns: APIActionRowComponent<APIButtonComponent> | null = null;
    if (!noBtn) {
      navBtns = {
        type: 1,
        components: [
          {
            type: ComponentType.Button,
            emoji: { id: "1207594669882613770", name: "left" },
            custom_id: `shards-scroll;date:${date.minus({ days: 1 }).toISODate()}` + (user ? `;user:${user}` : ""),
            style: ButtonStyle.Primary,
          },
          {
            type: ComponentType.Button,
            emoji: { id: "1207593237544435752", name: "right" },
            custom_id: `shards-scroll;date:${date.plus({ days: 1 }).toISODate()}` + (user ? `;user:${user}` : ""),
            style: ButtonStyle.Primary,
          },
        ],
      };
    }
    const row: APIActionRowComponent<APIButtonComponent> = {
      type: 1,
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
      result.image = {
        url: "https://media.discordapp.net/attachments/867638574571323424/1193308709183553617/20240107_0342171.gif",
      };
      result.description = `**${t("features:shards-embed.NO-SHARD")}**`;
      result.color = resolveColor("#9fb686");
    } else {
      const isActive = status.find((s) => s.active);
      const allEnded = status.every((s) => s.ended);
      const getIndex = (i: number) => i.toString() + utils.getSuffix(i);
      result.fields = [
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
              if (s.ended) return prefix + `~~${Utils.time(s.start.toUnixInteger(), "T")} - ${Utils.time(s.end.toUnixInteger(), "t")} (${t("features:shards-embed.FIELDS.COUNTDOWN.VALUE.ENDED", { DURATION: s.duration })})~~`;
              // prettier-ignore
              if (s.active) return prefix + `~~${Utils.time(s.start.toUnixInteger(), "T")}~~ - ${Utils.time(s.end.toUnixInteger(), "t")} (${t("features:shards-embed.FIELDS.COUNTDOWN.VALUE.ACTIVE", { DURATION: s.duration })}) <a:uptime:1228956558113771580>`;
              return (
                prefix +
                `${Utils.time(s.start.toUnixInteger(), "T")} - ${Utils.time(s.end.toUnixInteger(), "t")} (${t("features:shards-embed.FIELDS.COUNTDOWN.VALUE.EXPECTED", { DURATION: s.duration })})`
              );
            })
            .join("\n"),
          inline: true,
        },
      ];
      result.color = resolveColor(info.colors as ColorResolvable);
      result.thumbnail = { url: info.image };
    }

    return {
      embeds: [result],
      components: navBtns ? [row, navBtns] : [row],
    };
  }

  /**
   * Get Times Embed
   *
   * @param client Bot client
   * @param t translator
   * @param text text to include in the footer
   * @returns
   */
  static async getTimesEmbed(
    client: SkyHelper,
    t: ReturnType<typeof getTranslator>,
    text?: string,
  ): Promise<{ embeds: APIEmbed[]; components: APIActionRowComponent<APIStringSelectComponent | APIButtonComponent>[] }> {
    const tsData = await getTSData();
    const specialEvent = await getSpecialEvent();
    // Special Events
    const eventDesc =
      typeof specialEvent === "string"
        ? t("features:times-embed.EVENT_INACTIVE")
        : t("features:times-embed.EVENT_ACTIVE", {
            EVENT_NAME: specialEvent.name,
            DATE1: Utils.time(specialEvent.start.toUnixInteger(), "F"),
            DATE2: Utils.time(specialEvent.end.toUnixInteger(), "F"),
            DAYS: specialEvent.days,
            DURATION: specialEvent.duration,
            STARTS_ENDS: specialEvent.active ? t("features:times-embed.ENDS") : t("features:times-embed.STARTS"),
          });

    // Traveling spirit
    let tsDesc: string;
    if (!tsData) {
      tsDesc = "Unknown!";
    } else {
      const spirit: SpiritsData = client.spiritsData[tsData.value!];
      const emote = spirit?.expression?.icon || "❓";
      const strVisiting = t("features:times-embed.TS_VISITING", {
        TS_NAME: `${emote} ${spirit?.name || t("features:times-embed.TS_UPDATED")}`,
        DATE: Utils.time(tsData.nextVisit.plus({ days: 3 }).endOf("day").toUnixInteger(), "F"),
        DURATION: tsData.duration,
      });
      const strExpected = t("features:times-embed.TS_EXPECTED", {
        TS_NAME: `${emote} ${spirit?.name || t("features:times-embed.TS_UNKNOWN")}`,
        DATE: Utils.time(tsData.nextVisit.toUnixInteger(), "F"),
        DURATION: tsData.duration,
      });
      tsDesc = tsData.visiting ? strVisiting : strExpected;
    }
    let description = "";
    for (const [k, { status }] of skyutils.allEventDetails()) {
      // @ts-expect-error
      let desc = `\`${t(`features:times-embed.${k.toString().toUpperCase()}`)}:\` `;
      const nextTime = `<t:${status.nextTime.toUnixInteger()}:t> - <t:${status.nextTime.toUnixInteger()}:R>`;
      if (status.active) {
        desc += t("features:times-embed.ACTIVE", {
          END_TIME: `<t:${status.endTime.toUnixInteger()}:R>`,
          NEXT_TIME: nextTime,
        });
      } else {
        desc += nextTime;
      }
      description += desc + "\n";
    }

    description += `\`${t("features:times-embed.TS_TITLE")}:\`\n${tsDesc}`;
    description += `\n\`${t("features:times-embed.EVENT_TITLE")}:\`\n${eventDesc}`;
    // Build the Embed
    const embed: APIEmbed = {
      author: { name: t("features:times-embed.EMBED_AUTHOR"), icon_url: Utils.getUserAvatar(client.user) },
      title: t("features:times-embed.EMBED_TITLE", {
        SKY_TIME: DateTime.now().setZone("America/Los_Angeles").toFormat("hh:mm a"),
      }),
      color: resolveColor("Random"),
      description,
      timestamp: new Date().toISOString(),
    };
    if (text) embed.footer = { text, icon_url: Utils.getUserAvatar(client.user) };

    const row: APIActionRowComponent<APIStringSelectComponent> = {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.StringSelect,
          custom_id: "skytimes-details",
          placeholder: "Detailed Timelines",
          options: Object.entries(eventData)
            .filter(([, e]) => e.displayAllTimes)
            .map(([k, e]) => ({
              label: e.name.charAt(0).toUpperCase() + e.name.slice(1),
              value: k,
            })),
        },
      ],
    };

    const btn: APIActionRowComponent<APIButtonComponent> = {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.Button,
          custom_id: "times-refresh",
          emoji: { name: "🔃" },
          style: ButtonStyle.Primary,
        },
      ],
    };
    return { embeds: [embed], components: [row, btn] };
  }

  static dailyQuestEmbed(data: DailyQuestsSchema, index: number) {
    const { quests, rotating_candles } = data;
    const total = quests.length;
    const quest = quests[index];
    const now = DateTime.now().setZone("America/Los_Angeles").startOf("day");
    const nowFormatted = now.toFormat("dd-MM-yyyy");
    let desc = `${quest.images?.[0]?.by ? `© ${quest.images?.[0].by}` : ""}\n${quest.images?.[0]?.source ? `Source: ${quest.images?.[0].source}` : ""}`;
    const embed: APIEmbed = {
      author: {
        name: `Daily Quests (${index + 1}/${total})`,
        icon_url: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/72/Quest-icon.png",
      },
      title: quest.title + `\n${nowFormatted}`,
      footer: { text: `Page ${index + 1}/${total}` },
    };
    if (quest.images?.length) {
      const ext = quest.images[0].url.split("?")[0].split(".").pop();
      if (ext && ["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv"].includes(ext)) {
        desc += `\n**Video Guide**:  [Link](${quest.images[0].url})`;
      } else {
        embed.image = { url: quest.images[0].url };
      }
    }

    embed.description = desc;

    const selectMenu: APIActionRowComponent<APIStringSelectComponent> = {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.StringSelect,
          custom_id: Utils.encodeCustomId({ id: "daily_quests_select", date: nowFormatted }),
          options: quests.map((q, i) => ({
            label: q.title.slice(0, 50),
            value: i.toString(),
            default: i === index,
          })),
        },
      ],
    };
    const disabledSe =
      data.seasonal_candles &&
      now.equals(DateTime.fromISO(data.seasonal_candles.date, { zone: "America/Los_Angeles" }).startOf("day"))
        ? false
        : true;

    const nextBtn: APIButtonComponent = {
      type: ComponentType.Button,
      custom_id: Utils.encodeCustomId({ id: "daily-quests-scroll", index: (index + 1).toString(), date: nowFormatted }),
      label: (index === total - 1 ? `Quest ${total}` : `Quest ${index + 2}`) + " ▶",
      disabled: index === total - 1,
      style: ButtonStyle.Primary,
    };
    const prevBtn: APIButtonComponent = {
      type: ComponentType.Button,
      custom_id: Utils.encodeCustomId({ id: "daily-quests-scroll", index: (index - 1).toString(), date: nowFormatted }),
      label: "◀ " + (index === 0 ? `Quest 1` : `Quest ${index}`),
      disabled: index === 0,
      style: ButtonStyle.Primary,
    };
    const rotatingBtn: APIButtonComponent = {
      type: ComponentType.Button,
      custom_id: Utils.encodeCustomId({ id: "daily-quests-candles", type: "rotating", date: nowFormatted }),
      label: "Rotating Candles",
      style: ButtonStyle.Success,
    };
    const seasonalBtn: APIButtonComponent = {
      type: ComponentType.Button,
      custom_id: Utils.encodeCustomId({ id: "daily-quests-candles", type: "seasonal", date: nowFormatted }),
      label: "Seasonal Candles",
      disabled: disabledSe,
      style: ButtonStyle.Success,
    };
    const row: APIActionRowComponent<APIButtonComponent> = {
      type: ComponentType.ActionRow,
      components: [prevBtn, nextBtn, rotatingBtn],
    };
    if (rotating_candles) row.components.push(seasonalBtn);
    return { embeds: [embed], components: [selectMenu, row] };
  }
}
