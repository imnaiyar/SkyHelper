import { getActiveReminders } from "#src/database/getGuildDBValues.js";
import { Webhook } from "#src/structures/Webhook.js";
import { roleMention } from "@discordjs/builders";
import { getTranslator, LangKeys } from "./getTranslator.js";
import { logger } from "#src/structures/Logger.js";
import { SkytimesUtils as skyutils } from "skyhelper-utils";
import { resolveColor } from "../utils/resolveColor.js";
import { GuildSchema } from "#src/types.js";
import { throttleRequests } from "./throttleRequests.js";

type Events = "geyser" | "grandma" | "turtle" | "eden" | "reset";

/**
 * Sends the reminder to the each active guilds
 * @param type Type of the event
 */
export async function reminderSchedules(type: Events): Promise<void> {
  const activeGuilds = await getActiveReminders();
  await throttleRequests(activeGuilds, (data) => sendGuildReminder(data, type));
}

async function sendGuildReminder(guild: GuildSchema, type: Events) {
  const t = getTranslator(guild.language?.value ?? "en-US");
  try {
    const rmd = guild?.reminders;
    if (!rmd) return;
    const event = rmd[type];
    const { webhook, default_role } = rmd;
    if (!event?.active) return;
    if (!webhook.id || !webhook.token) return;
    const wb = new Webhook({ token: webhook.token, id: webhook.id });

    const roleid = event?.role ?? default_role ?? undefined;
    const role = roleid && t("features:reminders.ROLE_MENTION", { ROLE: roleMention(roleid) });

    let response = null;
    if (type === "eden") {
      response = t("features:reminders.EDEN_RESET");
    } else if (type === "reset") {
      response = t("features:reminders.DAILY_RESET");
    } else {
      response = getResponse(type, t);
    }
    if (!response) return;
    const msg = await wb
      .send({
        username: "SkyHelper",
        avatar_url: "https://skyhelper.xyz/assets/img/boticon.png",
        content: role,
        embeds: [
          {
            author: { name: "SkyHelper Reminders", icon_url: "https://skyhelper.xyz/assets/img/boticon.png" },
            title: t("features:reminders.TITLE", {
              // @ts-expect-error
              TYPE: t("features:times-embed." + (type === "reset" ? "DAILY-RESET" : type.toUpperCase())),
            }),
            description: response,
            color: resolveColor("Random"),
            timestamp: new Date().toISOString(),
          },
        ],
      })
      .catch((err) => {
        if (err.message === "Unknown Webhook") {
          return "Unknown Webhook";
        } else {
          logger.error(guild.data.name + " Reminder Error: ", err);
        }
      });
    if (event.last_messageId) await wb.deleteMessage(event.last_messageId).catch(() => {});
    if (msg === "Unknown Webhook") {
      guild.reminders.webhook.id = null;
      guild.reminders.active = false;
      guild.reminders.webhook.token = null;
      logger.error(`Reminders disabled for ${guild.data.name}, webhook not found!`);
    } else if (msg) {
      guild.reminders[type].last_messageId = msg.id;
    }
    await guild.save().catch((err) => logger.error(guild.data.name + " Error saving Last Message Id: ", err));
  } catch (err) {
    logger.error(err);
  }
}

/**
 * Get the response to send
 * @param type Type of the event
 * @param role Role mention, if any
 * @returns The response to send
 */
function getResponse(type: Events, t: (key: LangKeys, options?: {}) => string) {
  let skytime;
  let key = "";
  switch (type) {
    case "grandma":
      skytime = "Grandma";
      key = "grandma";
      break;
    case "geyser":
      skytime = "Geyser";
      key = "geyser";
      break;
    case "turtle":
      skytime = "Turtle";
      key = "turtle";
      break;
  }
  const { startTime, endTime, active } = skyutils.getEventDetails(key).status;
  if (!active) return t("features:reminders.ERROR");
  return `${t("features:reminders.COMMON", {
    // @ts-expect-error
    TYPE: t("features:times-embed." + skytime?.toUpperCase()),
    TIME: `<t:${startTime.unix()}:t>`,
    "TIME-END": `<t:${endTime.unix()}:t>`,
    "TIME-END-R": `<t:${endTime.unix()}:R>`,
  })}`;
}
