import { emojis, type REMINDERS_KEY } from "@skyhelperbot/constants";
import type { getTranslator, LangKeys } from "./getTranslator";
import { container, section, separator, ShardsUtil, textDisplay, thumbnail, type EventDetails } from "@skyhelperbot/utils";
import { MessageFlags } from "discord-api-types/v10";
import type { DateTime } from "luxon";
import { Schema, SchemaStore, t as tt } from "@sapphire/string-store";

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
    ? startTime
    : offset === 0 && !event.duration
      ? // Event with no duration will point to next time when it just became active for 0 offsetted reminder,
        // dial back to reflect correct time
        // TODO: currently this works because only eden and reset is affected, in future,
        //  if this includes any other events that also occurs on specific days, rethink this approach
        // possibly include previous occurrence in details accounting for occurrence day
        nextTime.minus({
          minutes: event.interval ?? 0,
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
        // @ts-expect-error key is known due to not being explicit
        TYPE: t("features:times-embed.EVENTS." + skytime.toUpperCase()),
        TIME: `<t:${startTime?.toUnixInteger()}:t>`,
        "TIME-END": `<t:${endTime?.toUnixInteger()}:t>`,
        "TIME-END-R": `<t:${endTime?.toUnixInteger()}:R>`,
      }) + (between ? `\n\n${between}` : "")
    );
  } else {
    if (["eden", "reset"].includes(type)) {
      return (
        t("features:reminders.PRE-RESET", {
          // @ts-expect-error same dynamic
          TYPE: t("features:times-embed.EVENTS." + skytime.toUpperCase()),
          TIME: `<t:${nextTime.toUnixInteger()}:t>`,
          "TIME-R": `<t:${nextTime.toUnixInteger()}:R>`,
        }) + (between ? `\n\n${between}` : "")
      );
    }

    return (
      t("features:reminders.PRE", {
        // @ts-expect-error same dynamic key but it is a valid key in runtime
        TYPE: t("features:times-embed.EVENTS." + skytime.toUpperCase()),
        TIME: `<t:${nextTime.toUnixInteger()}:t>`,
        "TIME-R": `<t:${nextTime.toUnixInteger()}:R>`,
      }) + (between ? `\n\n${between}` : "")
    );
  }
}

/**
 * Get the response for the Traveling Spirit
 * @param ts The Traveling Spirit data
 * @param t The translator function
 * @param roleM The role mention, if any
 * @returns The response to send
 */
export const getTSResponse = (
  ts: NonNullable<ReturnType<typeof import("@skyhelperbot/utils").getNextTs>>,
  t: ReturnType<typeof import("./getTranslator").getTranslator>,
) => {
  const visitingDates = `<t:${ts.nextVisit.toUnixInteger()}:D> - <t:${ts.nextVisit.plus({ days: 3 }).endOf("day").toUnixInteger()}:D>`;

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
};

export function getShardReminderResponse(
  now: DateTime,
  t: ReturnType<typeof getTranslator>,
  offset = 0,
  shardType?: Array<"red" | "black">,
) {
  const nextShard = ShardsUtil.getNextShard(now, shardType);
  if (!nextShard) return null;

  // shards lands at 40th second but the job interval runs every minute,
  // this is little comprise unless we change how it runs the interval for shards
  const adjustedDate = now.plus({ second: 40 });

  const upperBound = adjustedDate.plus({ seconds: 15 });
  const lowerBound = adjustedDate.minus({ seconds: 15 });
  const offsetted = nextShard.start.minus({ minutes: offset }).toMillis();

  if (!(offsetted >= lowerBound.toMillis() && offsetted <= upperBound.toMillis())) return null;

  const text = t("features:reminders.SHARDS", {
    SHARD_NUMBER: `${nextShard.index}${ShardsUtil.getSuffix(nextShard.index)}`,
    TIME: `<t:${nextShard.start.toUnixInteger()}:T> (<t:${nextShard.start.toUnixInteger()}:R>)`,
  });

  return [
    section(thumbnail(nextShard.info.image), text, emojis.tree_end + nextShard.info.type),
    separator(true, 1),
    section(
      {
        type: 2,
        custom_id: store.serialize(CustomId.ShardsRemindersDetails, { date: nextShard.start.toFormat("dd-MM-yyyy"), user: null }),
        label: "Info",
        style: 2,
      },
      `Location: ${nextShard.info.area}`,
      `Timeline: <t:${nextShard.start.toUnixInteger()}:T> - <t:${nextShard.end.toUnixInteger()}:T>`,
    ),
  ];
}

// Doing this just so custom_id is properly created that can also be parsed by bot
// ideal way would be move it to someplace common like /constants package, but some type issues going on there with this
// TODO: unify this in common package
enum CustomId {
  ShardsRemindersDetails = 22,
}
const store = new SchemaStore().add(new Schema(CustomId.ShardsRemindersDetails).string("date").nullable("user", tt.string));
