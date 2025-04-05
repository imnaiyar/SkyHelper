import { getActiveReminders, REMINDERS_KEY } from "@/database/getGuildDBValues.js";
import { Webhook } from "@/structures/Webhook.js";
import { roleMention } from "@discordjs/builders";
import { getTranslator, type LangKeys } from "./getTranslator.js";
import { logger } from "@/structures/Logger.js";
import { SkytimesUtils, type EventDetails } from "@skyhelperbot/utils";
import { resolveColor } from "@/utils/resolveColor.js";
import { throttleRequests } from "./throttleRequests.js";
import getTS, { type TSValue } from "@/utils/getTS.js";
import spiritsData, { type SpiritsData } from "@skyhelperbot/constants/spirits-datas";
import { seasonsData } from "@skyhelperbot/constants";
import type { APIEmbed } from "discord-api-types/v10";
import { DateTime } from "luxon";
import { checkReminderValid } from "./checkReminderValid.js";

type Events = (typeof REMINDERS_KEY)[number];

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
          response = getTSResponse(ts, t);
        } else {
          response = getResponse(key, t, details);
        }
        if (!response) continue;
        let toSend: any = response;

        if (key !== "ts") {
          toSend = {
            embeds: [
              {
                author: { name: "SkyHelper Reminders", icon_url: "https://skyhelper.xyz/assets/img/boticon.png" },
                title: t("features:reminders.TITLE", {
                  // @ts-expect-error
                  TYPE: t("features:times-embed." + (key === "reset" ? "DAILY-RESET" : key.toUpperCase())),
                }),
                description: response,
                color: resolveColor("Random"),
                timestamp: new Date().toISOString(),
              },
            ],
          };
        }
        const msg = await wb
          .send(
            {
              username: "SkyHelper",
              avatar_url: "https://skyhelper.xyz/assets/img/boticon.png",
              content: roleM || "",
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
  const skytime = type.charAt(0).toUpperCase() + type.slice(1);

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
const emojisMap = new Map();
emojisMap.set("realms", {
  "Isle of Dawn": "<:Isle:1150605424752590868>",
  "Daylight Prairie": "<:Prairie:1150605405408473179>",
  "Hidden Forest": "<:Forest:1150605383656800317>",
  "Valley of Triumph": "<:Valley:1150605355777273908>",
  "Golden Wasteland": "<:Wasteland:1150605333862027314>",
  "Vault of Knowledge": "<:Vault:1150605308364861580>",
  "Eye of Eden": "<:eden:1205960597456293969>",
});
emojisMap.set("seasons", {
  "Nine-Colored Deer": "<:ninecoloreddeer:1197412132657053746>",
  Revival: "<:revival:1163480957706321950>",
  Moments: "<:moments:1130958731211985019>",
  Passage: "<:passage:1130958698571911239>",
  Remembrance: "<:remembrance:1130958673959719062>",
  Aurora: "<:aurora:1130958641189621771>",
  Shattering: "<:shattering:1130961257097334895>",
  Performance: "<:performance:1130958595345895444>",
  Abyss: "<:abyss:1130958569748045845>",
  Flight: "<:flight:1130958544276045945>",
  "The Little Prince": "<:littleprince:1130958521253502987>",
  Assembly: "<:assembly:1130958465351811173>",
  Dreams: "<:dreams:1130958442232815646>",
  Prophecy: "<:prophecy:1130958414655279304>",
  Sanctuary: "<:sanctuary:1130958391347515573>",
  Enchantment: "<:enchantment:1130958367674867742>",
  Rhythm: "<:rhythm:1130958345352777849>",
  Belonging: "<:belonging:1130958323823423509>",
  Lightseekers: "<:lightseekers:1130958300293365870>",
  Gratitude: "<:gratitude:1130958261349261435>",
});

const isSeasonal = (data: SpiritsData) => "ts" in data;
const getTSResponse = (ts: TSValue, t: ReturnType<typeof getTranslator>) => {
  if (!ts) return { content: t("commands:TRAVELING-SPIRIT.RESPONSES.NO_DATA") };

  const visitingDates = `<t:${ts.nextVisit.toUnixInteger()}:D> - <t:${ts.nextVisit.plus({ days: 3 }).endOf("day").toUnixInteger()}:D>`;
  if (ts.value) {
    const spirit: SpiritsData = spiritsData[ts.value as keyof typeof spiritsData];
    if (!isSeasonal(spirit)) return { content: t("commands:TRAVELING-SPIRIT.RESPONSES.NO_DATA") };
    const emote = spirit.expression?.icon || "<:spiritIcon:1206501060303130664>";
    let description = ts.visiting
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
    description += `\n\n**${t("commands:TRAVELING-SPIRIT.RESPONSES.VISITING_TITLE")}** ${visitingDates}\n**${t("features:SPIRITS.REALM_TITLE")}:** ${
      emojisMap.get("realms")![spirit.realm!]
    } ${spirit.realm}\n**${t("features:SPIRITS.SEASON_TITLE")}:** ${Object.values(seasonsData).find((v) => v.name === spirit.season)?.icon} Season of ${spirit.season!}`;
    const embed: APIEmbed = {
      author: {
        name: t("commands:TRAVELING-SPIRIT.RESPONSES.EMBED_AUTHOR", { INDEX: ts.index }),
        icon_url: spirit.image,
      },
      description: description,
      title: emote! + " " + spirit.name + (spirit.extra ? ` (${spirit.extra})` : ""),
      fields: [
        {
          name: spirit.ts?.returned
            ? t("features:SPIRITS.TREE_TITLE", { CREDIT: spirit.tree!.by })
            : t("features:SPIRITS.SEASONAL_CHART", { CREDIT: spirit.tree!.by }),
          value: spirit
            .tree!.total.replaceAll(":RegularCandle:", "<:RegularCandle:1207793250895794226>")
            .replaceAll(":RegularHeart:", "<:regularHeart:1207793247792013474>")
            .replaceAll(":AC:", "<:AscendedCandle:1207793254301433926>"),
        },
      ],
      image: {
        url: "https://cdn.imnaiyar.site/" + spirit.tree!.image,
      },
      thumbnail: spirit.image ? { url: spirit.image } : undefined,
      footer: {
        text: "Learn more about this spirit by runninng /spirits command",
      },
    };
    return { embeds: [embed] };
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
    const embed: APIEmbed = {
      author: {
        name: t("commands:TRAVELING-SPIRIT.RESPONSES.EMBED_AUTHOR", { INDEX: "X" }),
      },
      description: description,
    };
    return { embeds: [embed] };
  }
};
