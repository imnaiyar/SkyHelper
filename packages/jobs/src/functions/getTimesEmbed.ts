import type { getTranslator } from "./getTranslator.js";
import { getSpecialEventDB } from "@/database/getSpecialEventDB.js";
import type { SpiritsData } from "@skyhelperbot/constants/spirits-datas";
import { type APIEmbed } from "discord-api-types/v10";
import spiritsData from "@skyhelperbot/constants/spirits-datas";
import getTS from "@/utils/getTS.js";
import { SkytimesUtils as skyutils } from "@skyhelperbot/utils";
import { resolveColor } from "@/utils/resolveColor.js";
import { DateTime } from "luxon";
/**
 * Get Times Embed
 * @param client Bot client

 * @param t translator
 * @param text text to include in the footer
 * @returns
 */
export const getTimesEmbed = async (t: ReturnType<typeof getTranslator>, text?: string): Promise<APIEmbed> => {
  const tsData = await getTS();
  const specialEvent = await getSpecialEvent();
  const eventDesc =
    typeof specialEvent === "string"
      ? t("features:times-embed.EVENT_INACTIVE")
      : t("features:times-embed.EVENT_ACTIVE", {
          EVENT_NAME: specialEvent.name,
          DATE1: `<t:${specialEvent.start.toUnixInteger()}:F>`,
          DATE2: `<t:${specialEvent.end.toUnixInteger()}:F>`,
          DAYS: specialEvent.days,
          DURATION: specialEvent.duration,
          STARTS_ENDS: specialEvent.active ? t("features:times-embed.ENDS") : t("features:times-embed.STARTS"),
        });
  let tsDesc: string;
  if (!tsData) {
    tsDesc = "Unknown!";
  } else {
    const spirit: SpiritsData = spiritsData[tsData.value as keyof typeof spiritsData];
    const emote = spirit?.expression?.icon || "❓";
    const strVisiting = t("features:times-embed.TS_VISITING", {
      TS_NAME: `${emote} ${spirit?.name || t("features:times-embed.TS_UPDATED")}`,
      DATE: `<t:${tsData.nextVisit.plus({ days: 3 }).endOf("day").toUnixInteger()}:F>`,
      DURATION: tsData.duration,
    });
    const strExpected = t("features:times-embed.TS_EXPECTED", {
      TS_NAME: `${emote} ${spirit?.name || t("features:times-embed.TS_UNKNOWN")}`,
      DATE: `<t:${tsData.nextVisit.toUnixInteger()}:F>`,
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
    author: { name: t("features:times-embed.EMBED_AUTHOR"), icon_url: "https://skyhelper.xyz/assets/img/boticon.png" },
    title: t("features:times-embed.EMBED_TITLE", {
      SKY_TIME: DateTime.now().setZone("America/Los_Angeles").toFormat("hh:mm a"),
    }),
    color: resolveColor("Random"),
    description,
    timestamp: new Date().toISOString(),
  };
  if (text) embed.footer = { text, icon_url: "https://skyhelper.xyz/assets/img/boticon.png" };

  return embed;
};

interface EventType {
  active: boolean;
  name: string;
  start: DateTime;
  end: DateTime;
  duration: string;
  days: number;
}
type T = EventType | string;
export const getSpecialEvent = async (): Promise<T> => {
  const data = await getSpecialEventDB();
  const { startDate, endDate, name } = data;
  const now = DateTime.now().setZone("America/Los_Angeles");
  const start = DateTime.fromFormat(startDate, "dd-MM-yyyy", { zone: "America/Los_Angeles" }).startOf("day");
  const end = DateTime.fromFormat(endDate, "dd-MM-yyyy", { zone: "America/Los_Angeles" }).endOf("day");

  if (now >= start && now <= end) {
    return {
      active: true,
      name: name,
      start: start,
      end: end,
      duration: end.diff(now, ["days", "hours", "minutes", "seconds"]).toFormat("d[d] h[h] m[m] s[s]"),
      days: end.diff(start, "days").days,
    };
  } else if (now < start) {
    return {
      active: false,
      name: name,
      start: start,
      end: end,
      duration: start.diff(now, ["days", "hours", "minutes", "seconds"]).toFormat("d'd' h'h' m'm' s's'"),
      days: Math.ceil(end.diff(start, "days").days),
    };
  } else {
    return "No Events";
  }
};
