import { getActiveReminders } from "@/database/getGuildDBValues.js";
import { Webhook } from "@/structures/Webhook.js";
import { getTranslator } from "./getTranslator.js";
import { logger } from "@/structures/Logger.js";
import { container, separator, SkytimesUtils, textDisplay } from "@skyhelperbot/utils";
import { throttleRequests } from "./throttleRequests.js";
import getTS from "@/utils/getTS.js";
import { DateTime } from "luxon";
import { checkReminderValid } from "./checkReminderValid.js";
import { AllowedMentionsTypes, MessageFlags, type RESTPostAPIChannelMessageJSONBody } from "discord-api-types/v10";
import { getResponse, getShardReminderResponse, getTSResponse } from "./getResponses.js";
import { REMINDERS_KEY } from "@skyhelperbot/constants";

const speciallyHandledReminders = ["ts", "shards-eruption"];
/**
 * Sends the reminder to the each active guilds
 * @param type Type of the event
 */
export async function reminderSchedules(): Promise<void> {
  const now = DateTime.now().setZone("America/Los_Angeles");

  const eventDetails = Object.fromEntries(SkytimesUtils.allEventDetails());

  const ts = await getTS()!;

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

      if (!details && !speciallyHandledReminders.includes(key)) continue; // details will not be available for 'ts', it is calculated separately

      // Do not check validity for shards-eruption, it is handled separately
      if (key !== "shards-eruption") {
        const isValid = checkReminderValid(now, details ?? ts, offset ?? 0);

        if (!isValid) continue;
      }

      try {
        const wb = new Webhook({ token: webhook.token, id: webhook.id });

        const roleM = role && t("features:reminders.ROLE_MENTION", { ROLE: role === guild._id ? "@everyone" : `<@&${role}>` });

        let response: RESTPostAPIChannelMessageJSONBody | null = null;

        switch (key) {
          case "shards-eruption": {
            const shard_type = "shard_type" in event ? event.shard_type : (["red", "black"] as Array<"red" | "black">);
            const data = getShardReminderResponse(now, offset || 0, shard_type);
            if (!data) continue;
            response = { components: data };
            break;
          }
          case "ts":
            if (!ts) continue; // Skip if ts is not available
            response = getTSResponse(ts, t);
            break;
          default: {
            const data = getResponse(key, t, details, offset || 0);
            response = {
              components: [
                container(
                  textDisplay(
                    "-# SkyHelper Reminders\n" +
                      `### ${t("features:reminders.TITLE", {
                        // @ts-expect-error
                        TYPE: t("features:times-embed." + (key === "reset" ? "DAILY-RESET" : key.toUpperCase())),
                      })}`,
                  ),
                  separator(),
                  textDisplay(data as string),
                ),
              ],
            };
          }
        }
        const msg = await wb
          .send(
            {
              username: "SkyHelper",
              avatar_url: "https://skyhelper.xyz/assets/img/boticon.png",
              ...response,
              components: [...(roleM ? [textDisplay(roleM)] : []), ...response.components!],
              flags: MessageFlags.IsComponentsV2,
              allowed_mentions: { parse: [AllowedMentionsTypes.Role, AllowedMentionsTypes.Everyone] },
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
          guild.reminders.events[key] = null;
          logger.error(`Reminders disabled for ${guild.data.name}, webhook not found!`);
        } else if (msg) {
          guild.reminders.events[key]!.last_messageId = msg.id;
        }
        await guild.save().catch((err) => logger.error(guild.data.name + " Error saving Last Message Id: ", err));
      } catch (err) {
        logger.error(err);
      }
    }
  });
}
