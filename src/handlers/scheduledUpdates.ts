import { buildShardEmbed, dailyQuestEmbed, getDailyEventTimes, getTimesEmbed } from "#handlers";
import type { GuildSchema } from "#libs";
import { getTranslator, langKeys } from "#src/i18n";
import type { SkyHelper } from "#structures";
import { type WebhookMessageCreateOptions, time, roleMention, WebhookClient } from "discord.js";
import moment from "moment";

/**
 * Updates Shards/Times Embeds
 * @param type Type of the event
 * @param client The bot client
 */
export async function eventSchedules(type: "shard" | "times", client: SkyHelper): Promise<void> {
  const currentDate = moment().tz(client.timezone);
  switch (type) {
    case "times": {
      const response = async (_t: ReturnType<typeof getTranslator>): Promise<WebhookMessageCreateOptions> => {
        const embed = await getTimesEmbed(client, _t);
        return { embeds: [embed] };
      };
      const data = await client.database.getActiveUpdates("times");
      await update(data, "autoTimes", client, response);
      break;
    }
    case "shard": {
      const response = async (t: ReturnType<typeof getTranslator>): Promise<WebhookMessageCreateOptions> =>
        buildShardEmbed(currentDate, t, t("shards-embed.FOOTER"), true);
      const data = await client.database.getActiveUpdates("shard");
      await update(data, "autoShard", client, response);
    }
  }
}

type events = "geyser" | "grandma" | "turtle" | "dailies" | "eden" | "reset" | "dailies";

/**
 * Sends the reminder to the each active guilds
 * @param client The bot client
 * @param type Type of the event
 */
export async function reminderSchedules(client: SkyHelper, type: events): Promise<void> {
  const activeGuilds = await client.database.getActiveReminders();
  const data = await client.database.getDailyQuests();
  activeGuilds.forEach(async (guild) => {
    const t = getTranslator(guild.language?.value ?? "en-US");
    try {
      const rmd = guild?.reminders;
      if (!rmd) return;
      const event = rmd[type];
      const { webhook, default_role } = rmd;
      if (!event?.active) return;
      if (!webhook.id || !webhook.token) return;
      const wb = new WebhookClient({ token: webhook.token, id: webhook.id }, { allowedMentions: { parse: ["roles"] } });

      const roleid = event?.role ?? default_role ?? "";
      const role = roleid && t("reminders.ROLE_MENTION", { ROLE: roleMention(roleid) });

      let response = null;
      if (type === "eden") {
        response = { content: `${role} ${t("reminders.EDEN_RESET")}` };
      } else if (type === "reset") {
        response = { content: `${role}${t("reminders.DAILY_RESET")}` };
      } else if (type === "dailies") {
        const d = dailyQuestEmbed(data, 0);
        response = {
          content: `${role}\u200B`,
          ...d,
        };
      } else {
        response = { content: getResponse(type, t, role) };
      }
      if (!response) return;
      wb.send({
        username:
          type === "dailies"
            ? t("reminders.DAILY_QUESTS")
            : // @ts-expect-error
              t("reminders.TITLE", { TYPE: t("times-embed." + (type === "reset" ? "DAILY" : type.toUpperCase())) }),
        avatarURL: client.user.displayAvatarURL(),
        ...response,
      })
        .then((msg) => {
          guild.reminders[type].last_messageId = msg?.id || undefined;
          guild.save().catch((err) => client.logger.error(guild.data.name + " Error saving Last Message Id: ", err));
        })
        .catch((err) => {
          if (err.message === "Unknown Webhook") {
            guild.reminders.webhook.id = null;
            guild.reminders.active = false;
            guild.reminders.webhook.token = null;
            guild
              .save()
              .then(() => client.logger.error(`Reminders disabled for ${guild.data.name}, webhook not found!`))
              .catch((er) => client.logger.error("Error Saving to Database" + ` ${type}[Guild: ${guild.data.name}]`, er));
          }
          client.logger.error(guild.data.name + " Reminder Error: ", err);
        });
      if (event.last_messageId) wb.deleteMessage(event.last_messageId).catch(() => {});
    } catch (err) {
      client.logger.error(err);
    }
  });
}

/**
 * Get the response to send
 * @param type Type of the event
 * @param role Role mention, if any
 * @returns The response to send
 */
function getResponse(type: events, t: (key: langKeys, options?: {}) => string, role: string) {
  let skytime;
  let offset = 0;
  switch (type) {
    case "grandma":
      skytime = "Grandma";
      offset = 30;
      break;
    case "geyser":
      skytime = "Geyser";
      offset = 0;
      break;
    case "turtle":
      skytime = "Turtle";
      offset = 50;
      break;
  }
  const { startTime, endTime, active } = getDailyEventTimes(offset);
  if (!active) return t("reminders.ERROR");
  return `${role}\n${t("reminders.COMMON", {
    // @ts-expect-error
    TYPE: t("times-embed." + skytime?.toUpperCase()),
    TIME: time(startTime.toDate(), "t"),
    "TIME-END": time(endTime.toDate(), "t"),
    "TIME-END-R": time(endTime.toDate(), "R"),
  })}`;
}

/**
 * Updates the message
 * @param data Arrray of Guild Documents from database
 * @param type Type of the event
 * @param client The bot client
 * @param response Response to send
 */
const update = async (
  data: GuildSchema[],
  type: "autoShard" | "autoTimes",
  client: SkyHelper,
  response: (t: ReturnType<typeof getTranslator>) => Promise<WebhookMessageCreateOptions>,
): Promise<void> => {
  data.forEach(async (guild) => {
    const event = guild[type];
    if (!event.webhook.id) return;
    const webhook = new WebhookClient(
      { token: event.webhook.token!, id: event.webhook.id },
      { allowedMentions: { parse: ["roles"] } },
    );
    const t = getTranslator(guild.language?.value ?? "en-US");
    const now = moment();
    webhook
      .editMessage(event.messageId, {
        content: t("shards-embed.CONTENT", { TIME: time(now.toDate(), "R") }),
        ...(await response(t)),
      })
      .catch((e) => {
        if (e.message === "Unknown Message" || e.message === "Unknown Webhook") {
          if (e.code === 10008) {
            webhook.delete().catch(() => {});
            client.logger.error(`Live ${type} disabled for ${guild.data.name}, message found deleted!`);
          }
          if (e.code === 10015) {
            client.logger.error(`Live ${type} disabled for ${guild.data.name}, webhook not found!`);
          }
          guild[type].webhook.id = null;
          guild[type].active = false;
          guild[type].messageId = "";
          guild[type].webhook.token = null;
          guild.save().catch((er) => client.logger.error("Error Saving to Database" + ` ${type}[Guild: ${guild.data.name}]`, er));
        }
      });
  });
};
