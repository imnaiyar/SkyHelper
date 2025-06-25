import { emojis, realms_emojis, seasonsData, type REMINDERS_KEY } from "@skyhelperbot/constants";
import type { LangKeys } from "./getTranslator";
import { container, section, separator, ShardsUtil, textDisplay, thumbnail, type EventDetails } from "@skyhelperbot/utils";
import type { SpiritsData } from "@skyhelperbot/constants/spirits-datas";
import type { TSValue } from "@/utils/getTS";
import spiritsData from "@skyhelperbot/constants/spirits-datas";
import { MessageFlags } from "discord-api-types/v10";
import type { DateTime } from "luxon";

/**
 * Get the response to send
 * @param type Type of the event
 * @param role Role mention, if any
 * @returns The response to send
 */
export function getResponse(
  type: (typeof REMINDERS_KEY)[number],
  t: (key: LangKeys, options?: {}) => string,
  details: EventDetails,
  offset: number,
) {
  const skytime = type === "reset" ? "Daily-Reset" : type;

  const {
    status: { startTime, endTime, nextTime, active },
    event,
  } = details;
  const start = active
    ? startTime!
    : offset === 0 && !event.duration
      ? // Event with no duration will point to next time when it just became active for 0 offsetted reminder,
        // dial back to reflect correct time
        // TODO: currently this works because only eden and reset is affected, in future,
        //  if this includes any other events that also occurs on specific days, rethink this approach
        // possibly include previous occurrence in details accounting for occurrence day
        nextTime.minus({
          minutes: event.interval || 0,
        })
      : nextTime;
  let between: string | null = null;
  if (event.duration) {
    between = `Timeline: <t:${start.toUnixInteger()}:T> - <t:${start.plus({ minutes: event.duration }).toUnixInteger()}:T>`;
  }
  if (active || (offset === 0 && !event.duration)) {
    if (["eden", "reset"].includes(type)) {
      return t(`features:reminders.${type === "eden" ? "EDEN" : "DAILY"}_RESET`);
    }

    return (
      t("features:reminders.COMMON", {
        // @ts-expect-error
        TYPE: t("features:times-embed." + skytime?.toUpperCase()),
        TIME: `<t:${startTime?.toUnixInteger()}:t>`,
        "TIME-END": `<t:${endTime?.toUnixInteger()}:t>`,
        "TIME-END-R": `<t:${endTime?.toUnixInteger()}:R>`,
      }) + (between ? `\n\n${between}` : "")
    );
  } else {
    if (["eden", "reset"].includes(type)) {
      return (
        t("features:reminders.PRE-RESET", {
          // @ts-expect-error
          TYPE: t("features:times-embed." + skytime?.toUpperCase()),
          TIME: `<t:${nextTime.toUnixInteger()}:t>`,
          "TIME-R": `<t:${nextTime.toUnixInteger()}:R>`,
        }) + (between ? `\n\n${between}` : "")
      );
    }

    return (
      t("features:reminders.PRE", {
        // @ts-expect-error
        TYPE: t("features:times-embed." + skytime?.toUpperCase()),
        TIME: `<t:${nextTime.toUnixInteger()}:t>`,
        "TIME-R": `<t:${nextTime.toUnixInteger()}:R>`,
      }) + (between ? `\n\n${between}` : "")
    );
  }
}

const isSeasonal = (data: SpiritsData) => "ts" in data;

/**
 * Get the response for the Traveling Spirit
 * @param ts The Traveling Spirit data
 * @param t The translator function
 * @param roleM The role mention, if any
 * @returns The response to send
 */
export const getTSResponse = (ts: TSValue, t: ReturnType<typeof import("./getTranslator").getTranslator>) => {
  if (!ts) return { content: t("commands:TRAVELING-SPIRIT.RESPONSES.NO_DATA") };

  const visitingDates = `<t:${ts.nextVisit.toUnixInteger()}:D> - <t:${ts.nextVisit.plus({ days: 3 }).endOf("day").toUnixInteger()}:D>`;
  if (ts.value) {
    const spirit: SpiritsData = spiritsData[ts.value as keyof typeof spiritsData];
    if (!isSeasonal(spirit)) return { content: t("commands:TRAVELING-SPIRIT.RESPONSES.NO_DATA") };
    const emote = spirit.expression?.icon || "<:spiritIcon:1206501060303130664>";
    const description = ts.visiting
      ? t("commands:TRAVELING-SPIRIT.RESPONSES.VISITING", {
          SPIRIT: "↪",
          TIME: `<t:${ts.nextVisit.plus({ days: 3 }).endOf("day").toUnixInteger()}:F>`,
          DURATION: ts.duration,
        })
      : t("commands:TRAVELING-SPIRIT.RESPONSES.EXPECTED", {
          SPIRIT: "↪",
          DATE: `<t:${ts.nextVisit.toUnixInteger()}:F>`,
          DURATION: ts.duration,
        });
    const headerContent = `-# ${t("commands:TRAVELING-SPIRIT.RESPONSES.EMBED_AUTHOR", { INDEX: ts.index })}\n### [${emote} ${spirit.name}${spirit.extra || ""}](https://sky-children-of-the-light.fandom.com/wiki/${spirit.name.split(" ").join("_")})\n${description}`;

    let lctn_link = spirit.location!.image;
    if (!lctn_link.startsWith("https://")) lctn_link = "https://cdn.imnaiyar.site/" + lctn_link;
    const totalCosts = spirit
      .tree!.total.replaceAll(":RegularCandle:", "<:RegularCandle:1207793250895794226>")
      .replaceAll(":RegularHeart:", "<:regularHeart:1207793247792013474>")
      .replaceAll(":AC:", "<:AscendedCandle:1207793254301433926>")
      .trim();

    const component = container(
      spirit.image ? section(thumbnail(spirit.image, spirit.name), headerContent) : textDisplay(headerContent),
      separator(true, 1),
      textDisplay(
        `\n\n**${t("commands:TRAVELING-SPIRIT.RESPONSES.VISITING_TITLE")}** ${visitingDates}\n**${t("features:SPIRITS.REALM_TITLE")}:** ${
          realms_emojis[spirit.realm!]
        } ${spirit.realm}\n**${t("features:SPIRITS.SEASON_TITLE")}:** ${Object.values(seasonsData).find((v) => v.name === spirit.season)?.icon} Season of ${spirit.season!}`,
      ),
      separator(true, 1),
      section(
        thumbnail("https://cdn.imnaiyar.site/" + spirit.tree!.image),
        `${emojis.right_chevron} ${
          spirit.ts?.returned
            ? t("features:SPIRITS.TREE_TITLE", { CREDIT: spirit.tree!.by })
            : t("features:SPIRITS.SEASONAL_CHART", { CREDIT: spirit.tree!.by })
        }`,
        totalCosts ? `-# ${totalCosts}` : "",
      ),
      section(
        thumbnail(lctn_link),
        `${emojis.right_chevron} ${t("features:SPIRITS.LOCATION_TITLE", { CREDIT: spirit.location!.by })}`,
        spirit.location!.description ? `-# ${emojis.tree_end}${spirit.location!.description}` : "",
      ),
    );

    return { components: [component], flags: MessageFlags.IsComponentsV2 };
  } else {
    let description = ts.visiting
      ? t("commands:TRAVELING-SPIRIT.RESPONSES.VISITING", {
          SPIRIT: t("features:SPIRITS.UNKNOWN"),
          TIME: `<t:${ts.nextVisit.plus({ days: 3 }).endOf("day").toUnixInteger()}:F>`,
          DURATION: ts.duration,
        })
      : t("commands:TRAVELING-SPIRIT.RESPONSES.EXPECTED", {
          SPIRIT: t("features:SPIRITS.UNKNOWN"),
          DATE: `<t:${ts.nextVisit.toUnixInteger()}:F>`,
          DURATION: ts.duration,
        });
    description += `\n\n**${t("commands:TRAVELING-SPIRIT.RESPONSES.VISITING_TITLE")}** ${visitingDates}`;
    const component = container(
      textDisplay(`**${t("commands:TRAVELING-SPIRIT.RESPONSES.EMBED_AUTHOR", { INDEX: "X" })}**`),
      separator(),
      textDisplay(description),
    );
    return { components: [component], flags: MessageFlags.IsComponentsV2 };
  }
};

export function getShardReminderResponse(now: DateTime, offset: number = 0, shardType?: ("red" | "black")[]) {
  const nextShard = ShardsUtil.getNextShard(shardType);
  if (!nextShard) return null;

  // shards lands at 40th second but the job interval runs every minute,
  // this is little comprise unless we change how it runs the interval for shards
  const adjustedDate = now.plus({ second: 40 });

  const upperBound = adjustedDate.plus({ seconds: 15 });
  const lowerBound = adjustedDate.minus({ seconds: 15 });
  const offsetted = nextShard.start.minus({ minutes: offset }).toMillis();

  if (!(offsetted >= lowerBound.toMillis() && offsetted <= upperBound.toMillis())) return null;

  const text = `${nextShard.index}${ShardsUtil.getSuffix(nextShard.index)} will fall at <t:${nextShard.start.toUnixInteger()}:T> (<t:${nextShard.start.toUnixInteger()}:R>)`;
  return container(
    section(thumbnail(nextShard.info.image), text),
    separator(true, 1),
    section(
      { type: 2, custom_id: "ss", label: "Shard Info", style: 2 },
      `Shard: ${nextShard.info.area}`,
      `Timeline: <t:${nextShard.start.toUnixInteger()}:T> - <t:${nextShard.end.toUnixInteger()}:T>`,
    ),
  );
}
