import { ShardsUtil as utils, shardsInfo, shardsTimeline } from "@skyhelperbot/utils";
import {
  ButtonStyle,
  ComponentType,
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIEmbed,
  type APISelectMenuComponent,
  type APISelectMenuOption,
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
import { MessageV2Flags, type ContainerComponent } from "@/types/component-v2";
import { container, mediaGallery, section, separator, textDisplay, thumbnail } from "../v2.js";
import { CalendarMonths, emojis } from "../constants.js";

export default class {
  /**
   * @param date The date for which the shards embed is to be built
   * @param footer The footer text for the embed
   * @param noBtn Whether to add buttons or not (for Scroll Buttons in Live Updates)
   */
  static buildShardEmbed(
    date: DateTime,
    t: ReturnType<typeof import("@/i18n").getTranslator>,
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

    const components: ContainerComponent = container(separator());

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
    if (status === "No Shard") {
      components.components.splice(0, 0, textDisplay(`-# ${t("features:shards-embed.AUTHOR")}\n${formatted}`));
      components.components.push(
        textDisplay(t("features:shards-embed.NO-SHARD")),
        mediaGallery({
          url: "https://media.discordapp.net/attachments/867638574571323424/1193308709183553617/20240107_0342171.gif",
        }),
        ...(navBtns ? [navBtns] : []),
      );
    } else {
      const getIndex = (i: number) => i.toString() + utils.getSuffix(i);
      components.components.splice(
        0,
        0,
        section(
          thumbnail(info.image, info.type),
          `-# ${t("features:shards-embed.AUTHOR")} - ${formatted}\n### ${info.type} (${info.rewards})\n`,
        ),
      );
      components.components.push(
        ...info.locations.map((l) =>
          section(thumbnail(l.image, l.description), l.description + `\n${emojis.tree_end}${info.area}`),
        ),
        separator(),
        section(
          {
            type: ComponentType.Button,
            label: "Details",
            custom_id: `shards-timeline;date:${date.toISODate()}`,
            style: ButtonStyle.Secondary,
          },
          `**${t("features:shards-embed.BUTTON1")}**` +
            "\n" +
            status
              .map((s, i, arr) => {
                const prefix = `${s.ended ? "-# " : ""}${i === arr.length - 1 ? emojis.tree_end : emojis.tree_top}**${getIndex(i + 1)} Shard:** `;
                // prettier-ignore
                if (s.ended) return prefix + `~~${Utils.time(s.start.toUnixInteger(), "T")} - ${Utils.time(s.end.toUnixInteger(), "t")} (${t("features:shards-embed.FIELDS.COUNTDOWN.VALUE.ENDED", { DURATION: `<t:${s.end.toUnixInteger()}:R>` })})~~`;
                // prettier-ignore
                if (s.active) return prefix + `~~${Utils.time(s.start.toUnixInteger(), "T")}~~ - ${Utils.time(s.end.toUnixInteger(), "t")} (${t("features:shards-embed.FIELDS.COUNTDOWN.VALUE.ACTIVE", { DURATION: `<t:${s.end.toUnixInteger()}:>` })}) <a:uptime:1228956558113771580>`;
                return (
                  prefix +
                  `${Utils.time(s.start.toUnixInteger(), "T")} - ${Utils.time(s.end.toUnixInteger(), "t")} (${t("features:shards-embed.FIELDS.COUNTDOWN.VALUE.EXPECTED", { DURATION: `<t:${s.start.toUnixInteger()}:R>` })})`
                );
              })
              .join("\n"),
        ),
        separator(),
        ...(navBtns ? [navBtns] : []),
      );
    }

    return {
      // TODO: skjjd
      // @ts-expect-error
      components: [components],
      flags: 32768 | 64,
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
  static async getTimesEmbed(client: SkyHelper, t: ReturnType<typeof getTranslator>) {
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
      // TODO: update tree emojis from localization in this for prod
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
    const now = DateTime.now().setZone("America/Los_Angeles");
    const component = container(
      textDisplay(
        `### ${t("features:times-embed.EMBED_TITLE")}\n${emojis.tree_end}\`Sky Time:\` ${now.toFormat("hh:mm a")} | \`Local Time\`: <t:${now.toUnixInteger()}:t>`,
      ),
      separator(),
    );
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
    component.components.push(
      textDisplay(description),
      separator(),
      textDisplay(`**${t("features:times-embed.TS_TITLE")}:**\n${tsDesc}`),
      textDisplay(`\n**${t("features:times-embed.EVENT_TITLE")}:**\n${eventDesc}`),
    );
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
    return { components: [component, row, btn], flags: 32768 };
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

  static buildCalendarResponse(
    t: ReturnType<typeof getTranslator>,
    client: SkyHelper,
    userId: string,
    { index, month, year }: ResponseParams = {},
  ) {
    const now = DateTime.now().setZone("America/Los_Angeles");
    const date = 1;
    month ??= now.month;
    const monthStr = CalendarMonths[month - 1];
    year ??= now.year;
    const datesArray = getDates(now);

    const setsOfDates = [];
    for (let i = 0; i < datesArray.length; i += 5) {
      setsOfDates.push(datesArray.slice(i, i + 5));
    }

    index ??= setsOfDates.findIndex((dates) => dates.some((d) => d.hasSame(now, "day")));
    const toGet = DateTime.fromObject({ year, month, day: date }, { zone: "America/Los_Angeles" });
    const dates = getDates(toGet);
    const total = dates.length;
    const totalPages = Math.ceil(total / 5);
    const start = index * 5;
    const end = start + 5;
    const toDisplay = dates.slice(start, end);
    const title = `${toDisplay[0].toFormat("DD")} - ${toDisplay[toDisplay.length - 1].toFormat("DD")}`;
    const options: APISelectMenuOption[] = [];
    for (let i = 0; i < totalPages; i++) {
      const start2 = i * 5;
      const end2 = start2 + 5;
      const dat = dates.slice(start2, end2);
      const label1 = dat[0].toFormat("d");
      const label2 = dat[dat.length - 1].toFormat("d");
      const label = `${label1}${utils.getSuffix(parseInt(label1))} - ${label2}${utils.getSuffix(parseInt(label2))}`;
      const value = `${i}`;
      options.push({ label, value, default: index === i });
    }
    const dateSelect: APIActionRowComponent<APISelectMenuComponent> = {
      type: 1,
      components: [
        {
          type: 3,
          custom_id: client.utils.encodeCustomId({
            id: "shards-calendar-0",
            type: "index",
            user: userId,
            month: month.toString(),
            year: year.toString(),
          }),
          placeholder: t("commands:SHARDS_CALENDAR.RESPONSES.DATE_SELECT_PLACEHOLDER"),
          options: options,
        },
      ],
    };
    const monthSelect: APIActionRowComponent<APISelectMenuComponent> = {
      type: 1,
      components: [
        {
          type: 3,
          custom_id: client.utils.encodeCustomId({
            id: "shards-calendar-1",
            type: "month",
            user: userId,
            month: month.toString(),
            year: year.toString(),
          }),
          placeholder: t("commands:SHARDS_CALENDAR.RESPONSES.MONTH_SELECT_PLACEHOLDER"),
          options: CalendarMonths.map((m, i) => ({
            label: m,
            value: (i + 1).toString(),
            default: month === i + 1,
          })),
        },
      ],
    };
    const yOptions: APISelectMenuOption[] = [];
    for (let i = year - 5; i < year + 5; i++) {
      yOptions.push({
        label: `${i}`,
        value: `${i}`,
        default: i === year,
      });
    }
    const yearSelect: APIActionRowComponent<APISelectMenuComponent> = {
      type: 1,
      components: [
        {
          type: 3,
          custom_id: client.utils.encodeCustomId({
            id: "shards-calendar-2",
            type: "year",
            user: userId,
            month: month.toString(),
            year: year.toString(),
          }),
          placeholder: t("commands:SHARDS_CALENDAR.RESPONSES.YEAR_SELECT_PLACEHOLDER"),
          options: yOptions,
        },
      ],
    };
    const navBtn: APIActionRowComponent<APIButtonComponent> = {
      type: 1,
      components: [
        {
          type: 2,
          custom_id: client.utils.encodeCustomId({
            id: `calendar-nav-2`,
            index: (index - 1).toString(),
            user: userId,
            month: month.toString(),
            year: year.toString(),
          }),
          emoji: { name: "⬅️" },
          style: 1,
          disabled: index === 0,
        },
        {
          type: 2,
          custom_id: client.utils.encodeCustomId({
            id: `calendar-nav-next`,
            index: (index + 1).toString(),
            user: userId,
            month: month.toString(),
            year: year.toString(),
          }),
          emoji: { name: "➡️" },
          style: 1,
          disabled: index === totalPages - 1,
        },
      ],
    };
    let description = "";
    toDisplay.forEach((d) => {
      const { currentRealm, currentShard } = utils.shardsIndex(d);
      const timelines = shardsTimeline(d)[currentShard];
      const noShard = utils.getStatus(d);
      const info = shardsInfo[currentRealm][currentShard];
      description += `**${
        d.hasSame(now, "day")
          ? client.utils.time(d.toUnixInteger(), "D") + ` (${t("features:shards-embed.TODAY")}) <a:uptime:1228956558113771580>`
          : client.utils.time(d.toUnixInteger(), "D")
      }**\n`;
      description +=
        typeof noShard === "string"
          ? "↪ " + t("commands:SHARDS_CALENDAR.RESPONSES.INFO.NO_SHARD")
          : `↪ ${t("commands:SHARDS_CALENDAR.RESPONSES.INFO.SHARD-INFO", { INFO: info.type, AREA: `*${info.area}*` })}\n↪ ${t("commands:SHARDS_CALENDAR.RESPONSES.INFO.SHARD-TIMES", { TIME: timelines.map((ti) => `${client.utils.time(ti.start.toUnixInteger(), "T")}`).join(" • ") })}\n\n`;
    });
    const component = container(
      textDisplay(
        `-# ${t("commands:SHARDS_CALENDAR.RESPONSES.EMBED_AUTHOR", { MONTH: monthStr, YEAR: year })}\n### ${title}\n${t(
          "commands:SHARDS_CALENDAR.RESPONSES.EMBED_DESCRIPTION",
          { shardsCmd: `</shards:1142231977328648364>` },
        )}\n`,
      ),
      separator(),
      textDisplay(
        description + `\n-# ${t("commands:SHARDS_CALENDAR.RESPONSES.EMBED_FOOTER", { INDEX: index + 1, TOTAL: totalPages })}`,
      ),
    );
    return { components: [component, dateSelect, monthSelect, yearSelect, navBtn] };
  }
}
function getDates(date: DateTime): DateTime[] {
  const totalDays = date.daysInMonth!;
  const dates: DateTime[] = [];
  for (let i = 1; i <= totalDays; i++) {
    dates.push(DateTime.fromObject({ year: date.year, month: date.month, day: i }, { zone: "America/Los_Angeles" }));
  }
  return dates;
}

type ResponseParams = {
  index?: number;
  month?: number;
  year?: number;
};
