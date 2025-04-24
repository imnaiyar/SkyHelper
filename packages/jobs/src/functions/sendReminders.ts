import { getActiveReminders, REMINDERS_KEY } from "@/database/getGuildDBValues.js";
import { Webhook } from "@/structures/Webhook.js";
import { roleMention } from "@discordjs/builders";
import { getTranslator, type LangKeys } from "./getTranslator.js";
import { logger } from "@/structures/Logger.js";
import { container, section, separator, SkytimesUtils, textDisplay, thumbnail, type EventDetails } from "@skyhelperbot/utils";
import { throttleRequests } from "./throttleRequests.js";
import getTS, { type TSValue } from "@/utils/getTS.js";
import spiritsData, { type SpiritsData } from "@skyhelperbot/constants/spirits-datas";
import { emojis, realms_emojis, seasonsData } from "@skyhelperbot/constants";
import { DateTime } from "luxon";
import { checkReminderValid } from "./checkReminderValid.js";
import { MessageFlags } from "discord-api-types/v10";

type Events = (typeof REMINDERS_KEY)[number];

// TODO: test reminders embeds first

/**
 * Sends the reminder to the each active guilds
 * @param type Type of the event
 */
export async function reminderSchedules(): Promise<void> {
  const now = DateTime.now().setZone("America/Los_Angeles");
  const eventDetails = Object.fromEntries(SkytimesUtils.allEventDetails());

  const ts = await getTS();

  const activeGuilds = await getActiveReminders();

  await throttleRequests(activeGuilds, async (guild) => {
    const t = getTranslator(guild.language?.value ?? "en-US");

    const reminders = guild.reminders;
    if (!reminders) return;
    for (const key of REMINDERS_KEY) {
      const event = reminders.events[key];
      if (!event || !event.active || !event.webhook) continue;

      const { webhook, role, last_messageId, offset } = event;
      const details = eventDetails[key === "reset" ? "daily-reset" : key];

      if (!details) continue;
      const isValid = checkReminderValid(now, details, offset ?? 0);

      if (!isValid) continue;

      try {
        const wb = new Webhook({ token: webhook.token, id: webhook.id });

        const roleM = role && t("features:reminders.ROLE_MENTION", { ROLE: roleMention(role) });

        let response = null;
        if (key === "ts") {
          if (!ts) continue;
          response = getTSResponse(ts, t, roleM);
        } else {
          response = getResponse(key, t, details);
        }
        if (!response) continue;
        let toSend: any = response;

        if (key !== "ts") {
          toSend = {
            components: [
              ...(roleM ? [textDisplay(roleM)] : []),
              container(
                textDisplay(
                  "-# SkyHelper Reminders\n" +
                    `### ${t("features:reminders.TITLE", {
                      // @ts-expect-error
                      TYPE: t("features:times-embed." + (key === "reset" ? "DAILY-RESET" : key.toUpperCase())),
                    })}`,
                ),
                separator(),
                textDisplay(response as string),
              ),
            ],
            flags: MessageFlags.IsComponentsV2,
          };
        }
        const msg = await wb
          .send(
            {
              username: "SkyHelper",
              avatar_url: "https://skyhelper.xyz/assets/img/boticon.png",
              ...toSend,
            },
            { thread_id: webhook.threadId, retries: 3 },
          )
          .catch((err) => {
            if (err.message === "Unknown Webhook") {
              return "Unknown Webhook";
            } else {
              logger.error(guild.data.name + " Reminder Error: ", err);
            }
          });
        if (last_messageId) await wb.deleteMessage(last_messageId, webhook.threadId).catch(() => {});
        if (msg === "Unknown Webhook") {
          guild.reminders.events[key] = {
            webhook: null,
            active: false,
            last_messageId: undefined,
            offset: null,
            role: null,
          };
          logger.error(`Reminders disabled for ${guild.data.name}, webhook not found!`);
        } else if (msg) {
          guild.reminders.events[key].last_messageId = msg.id;
        }
        await guild.save().catch((err) => logger.error(guild.data.name + " Error saving Last Message Id: ", err));
      } catch (err) {
        logger.error(err);
      }
    }
  });
}

/**
 * Get the response to send
 * @param type Type of the event
 * @param role Role mention, if any
 * @returns The response to send
 */
function getResponse(type: Events, t: (key: LangKeys, options?: {}) => string, details: EventDetails) {
  const skytime = type === "reset" ? "Daily-Reset" : type;

  const {
    status: { startTime, endTime, nextTime, active },
    event,
  } = details;
  const start = active ? startTime! : nextTime;
  let between: string | null = null;
  if (event.duration) {
    between = `Timeline: <t:${start.toUnixInteger()}:T> - <t:${start.plus({ minutes: event.duration }).toUnixInteger()}:T>`;
  }
  if (active) {
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

// TODO: Test this before merging
const getTSResponse = (ts: TSValue, t: ReturnType<typeof getTranslator>, roleM: string | null) => {
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

    return { components: [...(roleM ? [textDisplay(roleM)] : []), component], flags: MessageFlags.IsComponentsV2 };
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
    return { components: [...(roleM ? [textDisplay(roleM)] : []), component], flags: MessageFlags.IsComponentsV2 };
  }
};
