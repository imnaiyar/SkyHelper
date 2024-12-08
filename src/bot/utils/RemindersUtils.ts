import type { EventsKeys, GuildSchema, Reminders } from "#bot/libs/types";
import type { SkyHelper } from "#bot/structures/SkyHelper";
import { Guild, resolveColor, Routes, Webhook, type APIEmbed, type TextChannel } from "discord.js";

export class RemindersUtils {
  /**
   * Check if a channel has existing webhook by the bot and return that,
   * otherwise create a new one
   * @param channel The channel to check and create a webhook for
   * @param client The bot's client
   */
  static async checkBotsWb(channel: TextChannel, client: SkyHelper): Promise<Webhook> {
    const wbs = await channel.fetchWebhooks();
    const botWb = wbs.find((wb) => wb.owner?.id === client.user?.id);
    if (!botWb) {
      return this.createWebhook(channel);
    }
    return botWb;
  }

  /**
   * Create a webhook in the given channel
   * @param channel The channel to create the webhook in
   * @param reason The reason for creating the webhook
   */
  static createWebhook(channel: TextChannel, reason: string = "") {
    return channel.createWebhook({
      name: "SkyHelper Reminder",
      reason: reason ?? "For sending reminders",
      avatar: channel.client.user.displayAvatarURL(),
    });
  }

  /**
   * Delete a webhook by its ID and token only if the webhook is not used by any other events
   * @param client The bot's client
   * @param wb Webhook object of the schema containing id and token
   * @param events All the events in the schema to check if the webhook is used by other events
   * @param eventName The name of the event to exclude from the check
   * @param checkWb Whether to check if the webhook is used by other events
   * @param reason The reason for deleting the webhook
   */
  static deleteWebhook(
    client: SkyHelper,
    wb: Reminders["events"][EventsKeys]["webhook"],
    events: Reminders["events"],
    eventName: string,
    checkWb: boolean = true,
    reason: string = "No longer needed",
  ) {
    if (checkWb && Object.entries(events).some(([name, e]) => e.webhook.id === wb.id && name !== eventName)) return; // Do not delete if the webhook is used by other events
    return client.rest.delete(Routes.webhook(wb.id!, wb.token!), { reason });
  }

  /**
   * Enables an event reminder for a specific event and updates the guild settings.
   *
   * @param event - The key of the event to enable the reminder for.
   * @param setting - The guild settings schema to update.
   * @param wb - The webhook to use for sending the reminder.
   * @param role - The role to mention in the reminder, or null if no role should be mentioned.
   */
  static enableEventReminder(event: EventsKeys, setting: GuildSchema, wb: Webhook, role: string | null) {
    setting.reminders.events[event] = {
      active: true,
      webhook: {
        id: wb.id,
        token: wb.token,
        channelId: wb.channelId,
      },
      role,
    };
    setting.reminders.active = true;
    return setting.save();
  }

  /**
   * Disables a specified event in the guild's settings.
   *
   * @param event - The key of the event to disable.
   * @param setting - The guild's settings schema.
   * @param client - The SkyHelper client instance.
   *
   * @returns A promise that resolves when the settings have been saved.
   */
  static disableEvent(event: EventsKeys, setting: GuildSchema, client: SkyHelper) {
    const eventSetting = setting.reminders.events[event];
    if (!eventSetting.active) return;
    if (eventSetting.webhook.id) {
      this.deleteWebhook(client, eventSetting.webhook, setting.reminders.events, event)?.catch(() => {});
    }
    setting.reminders.events[event] = {
      active: false,
      webhook: {
        id: null,
        token: null,
        channelId: null,
      },
      role: null,
    };
    return setting.save();
  }

  /**
   * Generates an embed message containing the reminder settings for a specific guild.
   *
   * @param setting - The guild's schema containing reminder settings.
   * @param guild - The guild for which the reminder settings are being retrieved.
   * @returns An embed message with the reminder settings for the specified guild.
   */
  static getEventReminderStatus(setting: GuildSchema, guild: Guild) {
    let desc = `## Reminders settings for \`${guild.name}\`\n- **Status:** ${setting.reminders.active ? "Enabled" : "Disabled"}\n`;
    for (const [key, event] of Object.entries(setting.reminders.events)) {
      desc += `\n**${key}**\n  - **Active:** ${event.active ? "Yes" : "No"}\n  - **Role:** ${event.role ? `<@&${event.role}>` : "None"}`;
    }
    const embed: APIEmbed = {
      author: {
        name: "SkyHelper Reminders",
        icon_url: guild.client.user.displayAvatarURL(),
      },
      description: desc,
      color: resolveColor("Random"),
      timestamp: new Date().toISOString(),
    };
    return embed;
  }

  /**
   * Disables all reminder events for a given guild setting.
   *
   * This function performs the following steps:
   * * Collects all unique webhooks from the reminder events.
   * * Deletes each collected webhook using the provided client.
   * * Sets all reminder events to inactive and clears their webhook and role information.
   * * Sets the overall reminders active status to false.
   * * Saves the updated guild setting.
   *
   * @param setting - The guild setting containing reminder events to be disabled.
   * @param client - The client instance used to delete webhooks.
   * @returns A promise that resolves when the guild setting has been saved.
   */
  static disableAll(setting: GuildSchema, client: SkyHelper) {
    const wbsToDelete: Array<Reminders["events"][EventsKeys]["webhook"]> = [];
    for (const event of Object.values(setting.reminders.events)) {
      if (wbsToDelete.some((wb) => wb.id === event.webhook.id)) continue;
      wbsToDelete.push(event.webhook);
    }
    for (const wb of wbsToDelete) {
      this.deleteWebhook(client, wb, setting.reminders.events, "", false)?.catch(() => {});
    }
    for (const key of Object.keys(setting.reminders.events)) {
      setting.reminders.events[key as EventsKeys] = {
        active: false,
        webhook: {
          id: null,
          token: null,
          channelId: null,
        },
        role: null,
      };
    }
    setting.reminders.active = false;
    return setting.save();
  }
}
