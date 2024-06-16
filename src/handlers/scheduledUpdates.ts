import { buildShardEmbed, getDailyEventTimes, getEventEmbed } from "#handlers";
import type { GuildSchema } from "#libs";
import type { SkyHelper } from "#structures";
import { type WebhookMessageCreateOptions, time, roleMention } from "discord.js";
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
      const embed = await getEventEmbed(client);
      const response: WebhookMessageCreateOptions = { embeds: [embed] };
      const data = await client.database.getActiveUpdates("times");
      await update(data, "autoTimes", client, response);
      break;
    }
    case "shard": {
      const response: WebhookMessageCreateOptions = buildShardEmbed(currentDate, "Live Shard (updates every 5 min.)", true);
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
    try {
      const rmd = guild?.reminders;
      if (!rmd) return;
      const { grandma, geyser, dailies, turtle, reset, eden, webhook, default_role } = rmd;
      if (!grandma.active && !geyser.active && !eden.active && !turtle.active && !dailies.active) return;
      const typesEnum = {
        grandma: grandma,
        geyser: geyser,
        turtle: turtle,
        reset: reset,
        eden: eden,
        dailies: dailies,
      };
      const wb = await client.fetchWebhook(webhook.id!, webhook.token ?? undefined).catch(() => {});
      if (!wb) return;

      const roleid = typesEnum[type]?.role ?? default_role ?? "";
      const role = roleid && `Hey ${roleMention(roleid)}, `;

      let response = null;
      if (typesEnum[type].active) response = getResponse(type, role);
      if (type === "eden" && eden) {
        response = `${role} Eye of Eden just got reset, statues have been refreshed and can again be saved for ACs!`;
      }
      // TODO
      /* if (type === "dailies" && dailies.active) response = getDailiesResponse(type, role); */
      if (type === "reset" && reset.active) {
        response = `${role}The world of Sky just reset and daily quests have been refreshed!`;
      }
      if (!response) return;
      if (guild.reminders.prev_message) await wb.deleteMessage(guild.reminders.prev_message).catch(() => {});
      const msg = await wb
        .send({
          username: `${type.charAt(0).toUpperCase() + type.slice(1)} Reminder`,
          avatarURL: client.user.displayAvatarURL(),
          content: response,
          allowedMentions: {
            parse: ["roles"],
          },
        })
        .catch((err) => {
          client.logger.error(guild.data.name + ": ", err);
        });
      guild.reminders.prev_message = msg?.id || null;
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
function getResponse(type: events, role: string) {
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
  if (!active) return "This is not working as expected";
  return `${role}${skytime} just started (at ${time(startTime.toDate(), "t")}) and will end at ${time(endTime.toDate(), "t")} (${time(endTime.toDate(), "R")})`;
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
  response: WebhookMessageCreateOptions,
): Promise<void> => {
  data.forEach(async (guild) => {
    const event = guild[type];
    if (!event.webhook.id) return;
    const webhook = await client.fetchWebhook(event.webhook.id, event.webhook.token ?? undefined).catch(() => null);
    if (!webhook) {
      guild[type].active = false;
      guild[type].messageId = "";
      guild[type].webhook.id = null;
      guild[type].webhook.token = null;
      await guild.save();
      client.logger.error(`Live ${type} disabled for ${guild.data.name}, webhook found deleted!`);
      return;
    }

    webhook
      .editMessage(event.messageId, {
        content: `Last Update At: ${time(new Date(), "R")}`,
        ...response,
      })
      .catch((e) => {
        if (e.message === "Unknown Message") {
          guild[type].webhook.id = null;
          guild[type].active = false;
          guild[type].messageId = "";
          guild[type].webhook.token = null;
          guild.save();
          webhook.delete().catch(() => {});
          client.logger.error(`Live ${type} disabled for ${guild.data.name}, message found deleted!`);
          return;
        }
        client.logger.error(`AutoUpdate[${type}] for G: ${guild.data.name}:`, e);
      });
  });
};

