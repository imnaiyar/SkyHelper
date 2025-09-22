import { AllowedMentionsTypes, MessageFlags, type GatewayMessageCreateDispatchData } from "@discordjs/core";
import type { SkyHelper } from "@/structures";
import { dailyQuestEmbed } from "@/utils/classes/Embeds";
import { getTranslator } from "@/i18n";
import type { DailyQuest } from "@/types/custom";
import { DateTime } from "luxon";
import { textDisplay } from "@skyhelperbot/utils";

const titleRegex = /(?:\*\*[^*]*\*\*|[^*])(?<=\*\*)(.*?)(?=\*\*| by)/g;
const creditRegex = /by @?\w+/g;
const linkRegex = /https:\/\/discord\.com\/channels\/\d+\/\d+\/\d+/g;
let timer: NodeJS.Timeout | null = null;
/**
 * Extract quest details from a quest announcement message
 * @param message the message to extract quest details from
 */
export default async (message: GatewayMessageCreateDispatchData, client: SkyHelper) => {
  // ? This may be used to trigger the reminders (as this is usually the last message of daily quests)
  if (/Shattering Shard Summary/i.test(message.content)) return;

  // prettier-ignore
  if (message.content === "**Daily Quests**" || message.content === "`**Daily Quest**" || /^\*?\*?daily quests?\*?\*? by/i.test(message.content)) return;
  const title =
    message.content
      .replaceAll(/<a?:\w+:\d+>/g, "")
      .match(titleRegex)?.[0]
      .replaceAll(/[*_~]/g, "")
      .trim() ?? "[Quest Title Error]: Unknown";
  const credit = message.content.replaceAll(linkRegex, "").trim().match(creditRegex)?.[0].slice(3);
  const source = linkRegex.exec(message.content)?.[0];
  const images = message.attachments.map((attachment) => attachment.url);
  const data = await client.schemas.getDailyQuests();
  const guide: DailyQuest = {
    title: title,
    date: DateTime.now().setZone(client.timezone).startOf("day").toISO()!,
    images: images.map((img) => ({
      url: img,
      by: credit!,
      source,
    })),
  };

  if (/Rotating Treasure Candle/i.test(message.content)) data.rotating_candles = guide;
  else if (/Seasonal Candle/i.test(message.content)) data.seasonal_candles = guide;
  else if (message.content.includes("by")) data.quests.push(guide);

  const d = data.quests.filter((q) =>
    DateTime.fromISO(q.date).setZone(client.timezone).hasSame(DateTime.now().setZone(client.timezone).startOf("day"), "day"),
  );
  data.quests = d;

  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    // ! This is where the reminder will be scheduled and sent
    const today = DateTime.now().setZone(client.timezone).startOf("day");
    // Return if the reminders are already sent, prevent spam in case of some guides added way later
    if (!DateTime.fromISO(data.last_updated).setZone(client.timezone).startOf("day").hasSame(today, "day")) {
      dailyQuestRemindersSchedules(client).catch(client.logger.error);
    }
    data.last_updated = today.toISO()!;
    data.save().catch(client.logger.error);
  }, 6e5); // Ten minute timeout, assuming all the quests are posted within 10 minutes
};

// Send quests reminder

/**
 * Sends the daily quest reminder to the each subscribed guilds
 * @param client The bot client
 */
export async function dailyQuestRemindersSchedules(client: SkyHelper): Promise<void> {
  const activeGuilds = await client.schemas.getQuestActiveReminders();
  const data = await client.schemas.getDailyQuests();
  await Promise.all(
    activeGuilds.map(async (guild) => {
      const t = getTranslator(guild.language?.value ?? "en-US");
      try {
        const event = guild.reminders.events.dailies;
        if (!event?.active) return;
        const { webhook } = event;
        if (!webhook?.id || !webhook.token) return;

        const roleid = event.role ?? "";
        const role = roleid && t("features:reminders.ROLE_MENTION", { ROLE: `<@&${roleid}>` });

        let response = null;

        const d = dailyQuestEmbed(data, t);
        response = {
          components: [...(role ? [textDisplay(`${role}\u200B`)] : []), ...d.components],
        };
        await client.api.webhooks
          .execute(webhook.id, webhook.token, {
            username: t("features:reminders.DAILY_QUESTS"),
            avatar_url: client.utils.getUserAvatar(client.user),
            allowed_mentions: { parse: [AllowedMentionsTypes.Role] },
            wait: true,
            thread_id: webhook.threadId,
            ...response,
            flags: MessageFlags.IsComponentsV2,
          })
          .then((msg) => {
            event.last_messageId = msg.id || null;
            guild.save().catch((err) => client.logger.error(guild.data.name + " Error saving Last Message Id: ", err));
          })
          .catch((err) => {
            if (err.message === "Unknown Webhook") {
              event.active = false;
              event.webhook = null;
              guild
                .save()
                .then(() => client.logger.error(`Reminders disabled for ${guild.data.name}, webhook not found!`))
                .catch((er) =>
                  client.logger.error("Error Saving to Database" + ` [Daily Quest]: [Guild: ${guild.data.name}]: `, er),
                );
            }
            client.logger.error(guild.data.name + " Reminder Error: ", err);
          });
        if (event.last_messageId) {
          client.api.webhooks
            .deleteMessage(webhook.id, webhook.token, event.last_messageId, { thread_id: webhook.threadId })
            .catch(() => {});
        }
      } catch (err) {
        client.logger.error(err);
      }
    }),
  );
}
