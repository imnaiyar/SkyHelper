import { dailyQuestEmbed } from "#handlers";

import { getTranslator } from "#src/i18n";
import type { SkyHelper } from "#structures";
import { roleMention, WebhookClient } from "discord.js";

/**
 * Sends the daily quest reminder to the each subscribed guilds
 * @param client The bot client
 */
export async function dailyQuestRemindersSchedules(client: SkyHelper): Promise<void> {
  const activeGuilds = await client.database.getQuestActiveReminders();
  const data = await client.database.getDailyQuests();
  activeGuilds.forEach(async (guild) => {
    const t = getTranslator(guild.language?.value ?? "en-US");
    try {
      const rmd = guild.reminders;
      if (!rmd?.active) return;
      const event = rmd.dailies;
      const { webhook, default_role } = rmd;
      if (!event?.active) return;
      if (!webhook.id || !webhook.token) return;
      const wb = new WebhookClient({ token: webhook.token, id: webhook.id }, { allowedMentions: { parse: ["roles"] } });

      const roleid = event?.role ?? default_role ?? "";
      const role = roleid && t("reminders.ROLE_MENTION", { ROLE: roleMention(roleid) });

      let response = null;

      const d = dailyQuestEmbed(data, 0);
      response = {
        content: `${role}\u200B`,
        ...d,
      };
      if (!response) return;
      wb.send({
        username: t("reminders.DAILY_QUESTS"),
        avatarURL: client.user.displayAvatarURL(),
        ...response,
      })
        .then((msg) => {
          guild.reminders.dailies.last_messageId = msg?.id || undefined;
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
              .catch((er) =>
                client.logger.error("Error Saving to Database" + ` [Daily Quest]: [Guild: ${guild.data.name}]: `, er),
              );
          }
          client.logger.error(guild.data.name + " Reminder Error: ", err);
        });
      if (event.last_messageId) wb.deleteMessage(event.last_messageId).catch(() => {});
    } catch (err) {
      client.logger.error(err);
    }
  });
}
