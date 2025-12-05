import { ShardsUtil as utils, shardsInfo, shardsTimeline, row, button, getNextTs } from "@skyhelperbot/utils";
import {
  ButtonStyle,
  ComponentType,
  MessageFlags,
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIContainerComponent,
  type APIMessageTopLevelComponent,
  type APIStringSelectComponent,
} from "@discordjs/core";
import { DateTime } from "luxon";
import Utils from "./Utils.js";
import type { getTranslator } from "@/i18n";
import {
  eventData,
  SkytimesUtils as skyutils,
  container,
  mediaGallery,
  mediaGalleryItem,
  section,
  separator,
  textDisplay,
  thumbnail,
} from "@skyhelperbot/utils";
import type { SkyHelper } from "@/structures/Client";
import type { DailyQuestsSchema, GuildSchema } from "@/types/schemas";
import { CalendarMonths } from "../constants.js";
import { currency, emojis, RemindersEventsMap, zone } from "@skyhelperbot/constants";
import { paginate } from "../paginator.js";
import RemindersUtils from "./RemindersUtils.js";
import type { InteractionHelper } from "./InteractionUtil.js";
import { createActionId } from "@/planner/helpers/action.utils";
import { PlannerAction } from "@/types/planner";
import { fetchSkyData, PlannerService } from "@/planner";

/**
 * @param date The date for which the shards embed is to be built
 * @param footer The footer text for the embed
 * @param noBtn Whether to add buttons or not (for Scroll Buttons in Live Updates)
 */
export function buildShardEmbed(
  date: DateTime,
  t: ReturnType<typeof import("@/i18n").getTranslator>,
  noBtn?: boolean,
  user?: string,
  cleared?: boolean,
): {
  components: APIMessageTopLevelComponent[];
} {
  const { currentShard, currentRealm } = utils.shardsIndex(date);
  const info = shardsInfo[currentRealm]![currentShard]!;
  const today = DateTime.now().setZone("America/Los_Angeles").startOf("day");
  const formatted = date.hasSame(today, "day") ? t("features:shards-embed.TODAY") : date.toFormat("dd MMMM yyyy");
  const status = utils.getStatus(date);

  const navBtns: APIButtonComponent[] = [];
  if (!noBtn) {
    navBtns.push(
      {
        type: ComponentType.Button,
        emoji: Utils.parseEmoji(emojis.left_chevron)!,
        custom_id: Utils.store.serialize(Utils.customId.ShardsScroll, { date: date.minus({ days: 1 }).toISODate()!, user }),
        style: ButtonStyle.Primary,
      },
      {
        type: ComponentType.Button,
        emoji: Utils.parseEmoji(emojis.right_chevron)!,
        custom_id: Utils.store.serialize(Utils.customId.ShardsScroll, { date: date.plus({ days: 1 }).toISODate()!, user }),
        style: ButtonStyle.Primary,
      },
    );
  }

  let comp1: APIContainerComponent;
  let comp2: APIContainerComponent;

  if (status === "No Shard") {
    comp2 = container(textDisplay(`-# ${t("features:shards-embed.AUTHOR")}\n${formatted}`));

    comp1 = container(
      textDisplay(t("features:shards-embed.NO-SHARD")),
      mediaGallery(
        mediaGalleryItem("https://media.discordapp.net/attachments/867638574571323424/1193308709183553617/20240107_0342171.gif"),
      ),
    );
    if (navBtns.length) comp1.components.push(row(navBtns));
  } else {
    const getIndex = (i: number) => i.toString() + utils.getSuffix(i);

    // add cleared btn if red shard and curent day for planner
    if (typeof cleared === "boolean" && info.type === "red" && DateTime.now().setZone(zone).hasSame(date, "day")) {
      navBtns.push(
        button({
          label: cleared ? "Unclear" : "Cleared",
          custom_id: createActionId({ action: PlannerAction.ShardsCleared, navState: { user } }),
          emoji: { id: cleared ? emojis.red_shard : emojis.checkmark },
          style: cleared ? 4 : 2,
        }),
      );
    }

    comp2 = container(
      section(
        thumbnail(info.image, info.type),
        `-# ${t("features:shards-embed.AUTHOR")} - ${formatted}\n### ${
          info.type === "red"
            ? `${Utils.formatEmoji(emojis.red_shard, "RedShard")} Red Shard`
            : `${Utils.formatEmoji(emojis.black_shard, "BlackShard")} Black Shard`
        } (${
          info.wax ? `${info.wax} ${Utils.formatEmoji(emojis.wax, "Wax")}` : `${info.ac} ${Utils.formatEmoji(currency.ac, "AC")}`
        })\n${emojis.tree_end} ${info.area}`,
      ),
    );
    comp1 = container(
      section(
        {
          type: ComponentType.Button,
          emoji: Utils.parseEmoji(emojis.down_chevron)!,
          custom_id: Utils.store.serialize(Utils.customId.ShardsTimeline, {
            date: date.toISODate()!,
            user,
          }),
          style: ButtonStyle.Secondary,
        },
        `**${t("features:shards-embed.TIMELINE")}**` +
          "\n" +
          status
            .map((s, i, arr) => {
              const prefix = `${s.ended ? "-# " : ""}${i === arr.length - 1 ? emojis.tree_end : emojis.tree_middle}**${getIndex(i + 1)} Shard:** `;
              // prettier-ignore
              if (s.ended) return prefix + `~~${Utils.time(s.start.toUnixInteger(), "T")} - ${Utils.time(s.end.toUnixInteger(), "t")} (${t("features:shards-embed.COUNTDOWN.ENDED", { DURATION: `<t:${s.end.toUnixInteger()}:R>` })})~~`;
              // prettier-ignore
              if (s.active) return prefix + `~~${Utils.time(s.start.toUnixInteger(), "T")}~~ - ${Utils.time(s.end.toUnixInteger(), "t")} (${t("features:shards-embed.COUNTDOWN.ACTIVE", { DURATION: `<t:${s.end.toUnixInteger()}:R>` })}) <a:uptime:1228956558113771580>`;
              return (
                prefix +
                `${Utils.time(s.start.toUnixInteger(), "T")} - ${Utils.time(s.end.toUnixInteger(), "t")} (${t("features:shards-embed.COUNTDOWN.EXPECTED", { DURATION: `<t:${s.start.toUnixInteger()}:R>` })})`
              );
            })
            .join("\n"),
      ),
      separator(true, 1),
      section(thumbnail(info.location, t("features:shards-embed.LOCATION")), `**${t("features:shards-embed.LOCATION")}**`),
      section(thumbnail(info.data, t("features:shards-embed.DATA")), `**${t("features:shards-embed.DATA")}**`),
      ...(navBtns.length ? [separator(true, 1), row(navBtns)] : []),
    );
  }

  return {
    components: [comp2, comp1],
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
export async function getTimesEmbed(client: SkyHelper, t: ReturnType<typeof getTranslator>) {
  const plannerData = await fetchSkyData(client);
  const tsData = getNextTs();
  const specialEvent = PlannerService.getEvents(plannerData).upcoming[0];
  // Special Events
  const eventDesc = specialEvent
    ? t("features:times-embed.EVENT_ACTIVE", {
        EVENT_NAME: specialEvent.event.name,
        DATE1: Utils.time(specialEvent.instance.date.toUnixInteger(), "F"),
        DATE2: Utils.time(specialEvent.instance.endDate.toUnixInteger(), "F"),
        DAYS: Math.floor(specialEvent.instance.endDate.diff(specialEvent.instance.date, "days").days),
      })
    : t("features:times-embed.EVENT_INACTIVE");

  // Traveling spirit
  let tsDesc: string;
  if (!tsData) {
    tsDesc = "Unknown!";
  } else {
    const spirit = PlannerService.getCurrentTravelingSpirit(plannerData);
    // TODO: update tree emojis from localization in this for prod
    const strVisiting = t("features:times-embed.TS_VISITING", {
      TS_NAME: `${Utils.formatEmoji(spirit?.spirit.emoji, "_")} ${spirit?.spirit.name ?? t("features:times-embed.TS_UPDATED")}`,
      DATE: Utils.time(tsData.nextVisit.plus({ days: 3 }).endOf("day").toUnixInteger(), "F"),
      DURATION: tsData.duration,
    });
    const strExpected = t("features:times-embed.TS_EXPECTED", {
      TS_NAME: `${Utils.formatEmoji(spirit?.spirit.emoji, "_")} ${spirit?.spirit.name ?? t("features:times-embed.TS_UNKNOWN")}`,
      DATE: Utils.time(tsData.nextVisit.toUnixInteger(), "F"),
      DURATION: tsData.duration,
    });
    tsDesc = tsData.visiting ? strVisiting : strExpected;
  }
  const now = DateTime.now().setZone("America/Los_Angeles");
  const component = container(
    section(
      {
        type: ComponentType.Button,
        custom_id: Utils.store.serialize(Utils.customId.TimesRefresh, { user: null }),
        emoji: { id: "1205464032182665239", animated: true },
        style: ButtonStyle.Secondary,
      },
      `### ${t("features:times-embed.EMBED_TITLE")}\n${emojis.tree_end}\`Sky Time:\` ${now.toFormat("hh:mm a")} | \`Local Time\`: <t:${now.toUnixInteger()}:t>`,
    ),
    separator(),
  );
  let description = "";
  const data = skyutils.allEventDetails();
  for (const [i, [k, { status }]] of data.entries()) {
    let desc = `${
      i === 0 ? emojis.tree_top : i === data.length - 1 ? emojis.tree_end : emojis.tree_middle
      // @ts-expect-error can't properly resolve `k`
    }\`${t(`features:times-embed.EVENTS.${k.toUpperCase()}`)}:\` `;
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
  // Event select
  const select: APIActionRowComponent<APIStringSelectComponent> = {
    type: ComponentType.ActionRow,
    components: [
      {
        type: ComponentType.StringSelect,
        custom_id: Utils.store.serialize(Utils.customId.TimesDetailsRow, { user: null }),
        placeholder: "Detailed Timelines",
        options: Object.entries(eventData)
          .filter(([, e]) => e.displayAllTimes)
          .map(([k]) => ({
            // @ts-expect-error can't properly resolve `k`
            label: t(`features:times-embed.EVENTS.${k.toUpperCase()}`),
            value: k,
          })),
      },
    ],
  };
  component.components.push(
    textDisplay(`**${t("features:times-embed.TS_TITLE")}:**\n${tsDesc}`),
    textDisplay(`\n**${t("features:times-embed.EVENT_TITLE")}:**\n${eventDesc}`),
  );
  return {
    components: [component, container(textDisplay(description), separator(), select)],
  };
}

export function dailyQuestEmbed(data: DailyQuestsSchema, t: ReturnType<typeof getTranslator>) {
  const { quests, seasonal_candles } = data;
  const total = quests.length;
  const now = DateTime.now().setZone("America/Los_Angeles").startOf("day");
  const nowFormatted = now.toFormat("dd-MM-yyyy");
  const component = container(
    textDisplay(`### ${t("commands:DAILY_QUESTS.RESPONSES.EMBED_AUTHOR")} (${total}) :: ${nowFormatted}`),
    separator(),
  );
  for (const [index, quest] of quests.entries()) {
    let quest_title = quest.title;

    if (quest.images?.[0]?.source) quest_title = `[${quest_title}](${quest.images[0].source})`;
    if (quest.images?.length) {
      const ext = quest.images[0]?.url.split("?")[0]?.split(".").pop();
      const isVideo = ext && ["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv"].includes(ext);
      component.components.push(
        section(
          isVideo
            ? {
                label: "Video",
                custom_id: Utils.store.serialize(Utils.customId.QuestVideo, { index, date: nowFormatted, user: null }),
                type: 2,
                style: 2,
              }
            : thumbnail(quest.images[0]!.url, quest.title, true),
          `${quest_title}\n-# © ${quest.images[0]!.by || "Unknown"}`,
        ),
      );
    } else {
      component.components.push(textDisplay(`${quest_title}\n-# © ${quest.images?.[0]?.by ?? "Unknown"}`));
    }
  }
  const disabledSe =
    data.seasonal_candles &&
    now.equals(DateTime.fromISO(data.seasonal_candles.date, { zone: "America/Los_Angeles" }).startOf("day"))
      ? false
      : true;

  const rotatingBtn: APIButtonComponent = {
    type: ComponentType.Button,
    custom_id: Utils.store.serialize(Utils.customId.CandleButton, { type: "rotating", date: nowFormatted, user: null }),
    label: t("commands:DAILY_QUESTS.RESPONSES.BUTTON1"),
    style: ButtonStyle.Success,
  };
  const seasonalBtn: APIButtonComponent = {
    type: ComponentType.Button,
    custom_id: Utils.store.serialize(Utils.customId.CandleButton, { user: null, type: "seasonal", date: nowFormatted }),
    label: t("commands:DAILY_QUESTS.RESPONSES.BUTTON2"),
    disabled: disabledSe,
    style: ButtonStyle.Success,
  };
  const btnRow: APIActionRowComponent<APIButtonComponent> = {
    type: ComponentType.ActionRow,
    components: [rotatingBtn],
  };
  if (seasonal_candles) btnRow.components.push(seasonalBtn);
  component.components.push(separator(true, 1), btnRow);
  return { components: [component] };
}

export function buildCalendarResponse(
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
  const title = `${toDisplay[0]!.toFormat("DD")} - ${toDisplay[toDisplay.length - 1]!.toFormat("DD")}`;
  const navBtn: APIActionRowComponent<APIButtonComponent> = {
    type: 1,
    components: [
      {
        type: 2,
        custom_id: Utils.store.serialize(Utils.customId.CalenderNav, {
          index: index - 1,
          user: userId,
          month: month,
          year: year,
        }),
        emoji: { name: "⬅️" },
        style: 1,
        disabled: index === 0,
      },
      {
        type: 2,
        custom_id: Utils.store.serialize(Utils.customId.CalenderNav, {
          index: index + 1,
          user: userId,
          month: month,
          year: year,
        }),
        emoji: { name: "➡️" },
        style: 1,
        disabled: index === totalPages - 1,
      },
    ],
  };
  const description = toDisplay
    .map((d) => {
      const { currentRealm, currentShard } = utils.shardsIndex(d);
      const timelines = shardsTimeline(d)[currentShard];
      const noShard = utils.getStatus(d);
      const info = shardsInfo[currentRealm]![currentShard]!;
      let desc = `**${
        d.hasSame(now, "day")
          ? client.utils.time(d.toUnixInteger(), "D") + ` (${t("features:shards-embed.TODAY")}) <a:uptime:1228956558113771580>`
          : client.utils.time(d.toUnixInteger(), "D")
      }**\n`;
      desc +=
        typeof noShard === "string"
          ? emojis.tree_end + t("commands:SHARDS_CALENDAR.RESPONSES.INFO.NO_SHARD")
          : `${emojis.tree_middle}${t("commands:SHARDS_CALENDAR.RESPONSES.INFO.SHARD-INFO", { INFO: info.type, AREA: `*${info.area}*` })}\n${emojis.tree_end}${t("commands:SHARDS_CALENDAR.RESPONSES.INFO.SHARD-TIMES", { TIME: timelines.map((ti) => client.utils.time(ti.start.toUnixInteger(), "T")).join(" • ") })}`;
      return desc;
    })
    .join("\n\n");

  const component = container(
    section(
      {
        type: 2,
        custom_id: Utils.store.serialize(Utils.customId.CalendarDate, {
          month: month,
          year: year,
          user: userId,
        }),
        label: t("commands:SHARDS_CALENDAR.RESPONSES.CHANGE_BUTTON"),
        style: 2,
      },
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
  return { components: [component, container(navBtn)] };
}

export async function handleRemindersStatus(helper: InteractionHelper, guildSettings: GuildSchema, guildName: string, page = 0) {
  const title = helper.t("commands:REMINDERS.RESPONSES.STATUS.TITLE", { SERVER_NAME: guildName });
  const description =
    "### " +
    helper.t("commands:REMINDERS.RESPONSES.STATUS.STATUS", {
      STATUS: RemindersUtils.checkActive(guildSettings) ? "Active" : "Inactive",
    });
  const appEmojis = [...helper.client.applicationEmojis.values()];
  const paginator = await paginate(
    helper,
    Object.entries(RemindersEventsMap),
    (cdd, navBtns, { index }) => {
      const cont = container(
        mediaGallery(
          mediaGalleryItem(
            "https://cdn.discordapp.com/attachments/1145711466171867227/1387513144108384418/1750625456415_copy_1020x200.png?ex=685d9dd0&is=685c4c50&hm=824d6fe85b2cc8e0ffd226de38bf9a813068f7542f39476f56c8a9bb9ef8529d&",
          ),
        ),
        textDisplay(title),
        separator(),
        textDisplay(description),
      );
      for (const [k, name] of cdd) {
        const event = guildSettings.reminders.events[k as keyof GuildSchema["reminders"]["events"]];

        const eventEmojis = appEmojis
          .filter((e) => e.name.startsWith(k.replaceAll("-", "")))
          .sort((a, b) => Number(a.name.split("_").at(-1)) - Number(b.name.split("_").at(-1)))
          .map((e) => `<${e.animated ? "a" : ""}:${e.name}:${e.id}>`);

        let text = `${eventEmojis[0]}${eventEmojis[1]}  **${name}**\n${eventEmojis[2]}${eventEmojis[3]}  ${event?.active ? "Active" : "Inactive"}`;
        text +=
          `\n-# - ` +
          helper.t("commands:REMINDERS.RESPONSES.STATUS.CHANNEL", {
            CHANNEL:
              (event?.webhook?.threadId ?? event?.webhook?.channelId)
                ? `<#${event.webhook.threadId ?? event.webhook.channelId}>`
                : "None",
          });

        text +=
          " | " + helper.t("commands:REMINDERS.RESPONSES.STATUS.ROLE", { ROLE: event?.role ? `<@&${event.role}>` : "None" });

        text += ` | ` + helper.t("commands:REMINDERS.RESPONSES.OFFSET", { OFFSET: event?.offset ?? 0 });

        text += event?.shard_type
          ? ` | ` + helper.t("commands:REMINDERS.RESPONSES.SHARD_TYPE", { SHARD_TYPE: event.shard_type.join(", ") })
          : "";

        cont.components.push(
          section(
            {
              type: 2,
              custom_id: helper.client.utils.store.serialize(helper.client.utils.customId.RemindersManage, {
                key: k,
                user: helper.user.id,
                page: index,
              }),
              emoji: {
                animated: true,
                id: "1228956650757427220",
              },
              style: 2,
            },
            text,
          ),
          separator(false, 2),
        );
      }
      return { components: [cont, navBtns], flags: MessageFlags.IsComponentsV2 };
    },
    { per_page: 4, startPage: page },
  );

  paginator.on("collect", (i) => {
    const { id } = helper.client.utils.store.deserialize(i.data.custom_id);
    // stop the paginator when message is changed, as this will be recreated
    if (id === helper.client.utils.customId.RemindersManage) paginator.stop("no disable");
  });
}

function getDates(date: DateTime): DateTime[] {
  const totalDays = date.daysInMonth!;
  const dates: DateTime[] = [];
  for (let i = 1; i <= totalDays; i++) {
    dates.push(DateTime.fromObject({ year: date.year, month: date.month, day: i }, { zone: "America/Los_Angeles" }));
  }
  return dates;
}

interface ResponseParams {
  index?: number;
  month?: number;
  year?: number;
}
