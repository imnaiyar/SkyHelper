import { buildShardEmbed, getDailyEventTimes, getTimesEmbed } from "#handlers";
import type { GuildSchema } from "#libs";
import { getTranslator, langKeys } from "#src/i18n";
import type { SkyHelper } from "#structures";
import { type WebhookMessageCreateOptions, time, roleMention, Webhook } from "discord.js";
import moment from "moment";

/**
 *
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

type events = "geyser" | "grandma" | "turtle" | "dailies" | "eden" | "reset";
/**
 * Sends the reminder to the each active guilds
 * @param client The bot client
 * @param type Type of the event
 */
export async function reminderSchedules(client: SkyHelper, type: events): Promise<void> {
  const activeGuilds = await client.database.getActiveReminders();
  activeGuilds.forEach(async (guild) => {
    const t = getTranslator(guild.language?.value ?? "en-US");
    try {
      const rmd = guild?.reminders;
      if (!rmd) return;
      const event = rmd[type];
      const { webhook, default_role } = rmd;
      if (!event?.active) return;

      const wb = await client.fetchWebhook(webhook.id!, webhook.token ?? undefined).catch(() => {});
      if (!wb) return;

      const roleid = event?.role ?? default_role ?? "";
      const role = roleid && t("reminders.ROLE_MENTION", { ROLE: roleMention(roleid) });

      let response = null;
      if (event.active) response = getResponse(type, t, role);
      if (type === "eden") {
        response = `${role} ${t("reminders.EDEN_RESET")}`;
      }
      // TODO
      /* if (type === "dailies" && dailies.active) response = getDailiesResponse(type, role); */
      if (type === "reset") {
        response = `${role}${t("reminders.DAILY_RESET")}`;
      }
      if (!response) return;
      if (event.last_messageId) await wb.deleteMessage(event.last_messageId).catch(() => {});
      const msg = await wb
        .send({
          // @ts-expect-error
          username: t("reminders.TITLE", { TYPE: t("times-embed." + type.toUpperCase()) }),
          avatarURL: client.user.displayAvatarURL(),
          content: response,
          allowedMentions: {
            parse: ["roles"],
          },
        })
        .catch((err) => {
          client.logger.error(guild.data.name + ": ", err);
        });
      guild.reminders[type]!.last_messageId = msg?.id || undefined;
      await guild.save();
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
  const batchSize = 10; // Process guilds in batches of 10 to reduce load
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (guild) => {
        const event = guild[type];
        if (!event.webhook.id) return;

        const webhook = await client.fetchWebhook(event.webhook.id, event.webhook.token ?? undefined).catch((e) => e);

        if (!(webhook instanceof Webhook)) {
          if (webhook.message === "Unknown Webhook") {
            guild[type].webhook.id = null;
            guild[type].active = false;
            guild[type].messageId = "";
            guild[type].webhook.token = null;
            await guild.save();
            client.logger.error(`Live ${type} disabled for ${guild.data.name}, webhook not found!`);
            return;
          }
          client.logger.error(`AutoUpdate[${type}] Error Fetching Webhook for the Guild: ${guild.data.name}:`, webhook);
          return;
        }

        const t = getTranslator(guild.language?.value ?? "en-US");
        try {
          await webhook.editMessage(event.messageId, {
            content: t("shards-embed.CONTENT"),
            ...(await response(t)),
          });
        } catch (e: any) {
          if (e.message === "Unknown Message") {
            guild[type].webhook.id = null;
            guild[type].active = false;
            guild[type].messageId = "";
            guild[type].webhook.token = null;
            await guild.save();
            await webhook.delete().catch(() => {});
            client.logger.error(`Live ${type} disabled for ${guild.data.name}, message found deleted!`);
          } else {
            client.logger.error(`AutoUpdate[${type}] for G: ${guild.data.name}:`, e);
          }
        }
      }),
    );
  }
};
