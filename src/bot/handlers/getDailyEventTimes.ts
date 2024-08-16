import type { SpiritsData, Times } from "#libs/types";
import type { SkyHelper } from "#structures";
import { EmbedBuilder, time } from "discord.js";
import getEvent from "#handlers/getSpecialEvent";
import moment from "moment-timezone";
import "moment-duration-format";

export function getDailyEventTimes(offset: number): Times {
  const now = moment().tz("America/Los_Angeles");
  const start = now.clone().startOf("day").add(offset, "minutes");
  const end = start.clone().add(15, "minute");
  while (start.isBefore(now) && end.isBefore(now)) {
    start.add(2, "hours");
    end.add(2, "hours");
  }
  if (now.isBetween(start, end)) {
    return {
      active: true,
      startTime: start,
      endTime: end,
      nextTime: start.clone().add(2, "hours"),
      duration: moment.duration(end.diff(now)).format("d[d] h[h] m[m] s[s]"),
    };
  } else {
    return {
      active: false,
      nextTime: start,
      duration: moment.duration(start.diff(now)).format("d[d] h[h] m[m] s[s]"),
    };
  }
}

export const getEdenTimes = (): Times => {
  const now = moment().tz("America/Los_Angeles");
  const currentDayOfWeek = now.day();
  const daysToAdd = 0 - currentDayOfWeek;
  const edenTargetTime = now.clone().startOf("day").add(daysToAdd, "days");
  if (daysToAdd <= 0 || (daysToAdd === 0 && now.isAfter(edenTargetTime))) {
    edenTargetTime.add(7, "days");
  }
  if (now.isSameOrAfter(edenTargetTime)) {
    edenTargetTime.add(7, "days");
  }
  const dur = moment.duration(edenTargetTime.diff(now)).format("d[d] h[h] m[m] s[s]");
  return {
    active: false,
    nextTime: edenTargetTime,
    duration: dur,
  };
};

import { getTS } from "#handlers";
import type { getTranslator } from "#bot/i18n";
/**
 * Get Times Embed
 * @param client Bot client

 * @param t translator
 * @param text text to include in the footer
 * @returns
 */
export const getTimesEmbed = async (
  client: SkyHelper,
  t: ReturnType<typeof getTranslator>,
  text?: string,
): Promise<EmbedBuilder> => {
  const geyser = getTimes(0, t, "Geyser");
  const grandma = getTimes(30, t, "Grandma");
  const turtle = getTimes(50, t, "Turtle");
  const reset = getTimes(0, t, "Daily");
  const eden = t("times-embed.EDEN_RESET", {
    DATE: time(getEdenTimes().nextTime.toDate(), "F"),
    DURATION: getEdenTimes().duration,
  });
  const tsData = await getTS();
  const event = await getEvent();
  const eventDesc =
    typeof event === "string"
      ? t("times-embed.EVENT_INACTIVE")
      : t("times-embed.EVENT_ACTIVE", {
          EVENT_NAME: event.name,
          DATE1: time(event.start.unix(), "F"),
          DATE2: time(event.end.unix(), "F"),
          DAYS: event.days,
          DURATION: event.duration,
          STARTS_ENDS: event.active ? t("times-embed.ENDS") : t("times-embed.STARTS"),
        });
  let tsDesc: string;
  if (!tsData) {
    tsDesc = "Unknown!";
  } else {
    const spirit: SpiritsData = client.spiritsData[tsData.value as keyof typeof client.spiritsData];
    const emote = spirit?.emote?.icon || spirit?.call?.icon || spirit?.stance?.icon || spirit?.action?.icon || "❓";
    const strVisiting = t("times-embed.TS_VISITING", {
      TS_NAME: `${emote} ${spirit?.name || t("times-embed.TS_UPDATED")}`,
      DATE: time(tsData.nextVisit.clone().add(3, "days").endOf("day").toDate(), "F"),
      DURATION: tsData.duration,
    });
    const strExpected = t("times-embed.TS_EXPECTED", {
      TS_NAME: `${emote} ${spirit?.name || t("times-embed.TS_UNKNOWN")}`,
      DATE: time(tsData.nextVisit.toDate(), "F"),
      DURATION: tsData.duration,
    });
    tsDesc = tsData.visiting ? strVisiting : strExpected;
  }
  const embed = new EmbedBuilder()
    .setAuthor({ name: t("times-embed.EMBED_AUTHOR"), iconURL: client.user.displayAvatarURL() })
    .setTitle(t("times-embed.EMBED_TITLE"))
    .setColor("Random")
    .addFields(
      {
        name: t("times-embed.GEYSER"),
        value: geyser.description,
        inline: true,
      },
      {
        name: t("times-embed.GRANDMA"),
        value: grandma.description,
        inline: true,
      },
      {
        name: t("times-embed.TURTLE"),
        value: turtle.description,
        inline: true,
      },
      {
        name: t("times-embed.DAILY"),
        value: reset.description,
        inline: true,
      },
      {
        name: t("times-embed.EDEN"),
        value: eden,
        inline: true,
      },
      {
        name: t("times-embed.TS_TITLE"),
        value: tsDesc,
        inline: true,
      },
      {
        name: t("times-embed.EVENT_TITLE"),
        value: eventDesc,
        inline: true,
      },
    )
    .setTimestamp();
  if (text) embed.setFooter({ text: text, iconURL: client.user.displayAvatarURL() });
  return embed;
};

export function getTimes(
  offset: number,
  t: ReturnType<typeof getTranslator>,
  type: string,
): { title: string; description: string } {
  const times = getDailyEventTimes(offset);
  if (type.toLocaleLowerCase().includes("daily")) {
    const resetAt = moment().tz("America/Los_Angeles").startOf("day").add(1, "day");
    const duration = moment.duration(resetAt.diff(moment().tz("America/Los_Angeles"))).format("d[d] h[h] m[m] s[s]");
    return {
      title: type,
      description: t("times-embed.COUNTDOWN", {
        TIME: time(resetAt.unix(), "t"),
        DURATION: duration,
      }),
    };
  }
  // TODO: Add emoji for active events

  if (times.active) {
    return {
      title: type + " <a:uptime:1228956558113771580>",
      description: `${t("times-embed.ACTIVE", {
        TIME: time(times.endTime!.unix(), "t"),
        DURATION: times.duration,
      })}\n${t("times-embed.NEXT-OCC", {
        TIME: time(times.nextTime.unix(), "t"),
      })}`,
    };
  }
  return {
    title: type,
    description: t("times-embed.NEXT", {
      TIME: time(times.nextTime.unix(), "t"),
      DURATION: times.duration,
    }),
  };
}
