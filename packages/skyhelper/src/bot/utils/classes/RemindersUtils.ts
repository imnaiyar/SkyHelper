import type { SkyHelper } from "@/structures";
import type { GuildSchema } from "@/types/schemas";
import type { APIWebhook, RESTPostAPIChannelWebhookJSONBody } from "@discordjs/core";

export default class {
  constructor(private client: SkyHelper) {}
  private fetchWebhooks(channelId: string): Promise<APIWebhook[]> {
    return this.client.api.channels.getWebhooks(channelId);
  }

  private createWebhook(channelId: string, data: RESTPostAPIChannelWebhookJSONBody, reason?: string): Promise<APIWebhook> {
    return this.client.api.channels.createWebhook(channelId, data, { reason });
  }

  /** Check whether any of the reminder events are active or not */
  static checkActive(settings: GuildSchema) {
    return Object.values(settings.reminders.events).some((e) => e?.active);
  }

  private checkWebhookUsage(settings: GuildSchema, webhook: { id: string; token: string }, excludeKeys: string[]) {
    const keys = Object.keys(settings.reminders.events).filter((k) => !excludeKeys.includes(k));
    const liveUse =
      (!excludeKeys.includes("autoShard") && settings.autoShard?.webhook?.id === webhook.id) ||
      (!excludeKeys.includes("autoTimes") && settings.autoTimes?.webhook?.id === webhook.id);
    return (
      keys.some(
        (key) => settings.reminders.events[key as keyof GuildSchema["reminders"]["events"]]?.webhook?.id === webhook.id,
      ) || liveUse
    );
  }

  /**
   * Creates a webhook in the given channel only if there is no webhook by the client in the said channel
   *
   * @param channelId The channel ID to create the webhook in
   * @param data The webhook data
   * @param reason The reason for creating the webhook
   * @returns
   */
  async createWebhookAfterChecks(channelId: string, data: RESTPostAPIChannelWebhookJSONBody, reason?: string) {
    const channelWebhooks = await this.fetchWebhooks(channelId);
    const clientWebhook = channelWebhooks.find((w) => w.application_id === this.client.user.id);
    return clientWebhook || this.createWebhook(channelId, data, reason);
  }

  /**
   * Deletes a webhook only if it is not being used by client in any other event
   *
   * @param webhook The webhook to delete
   * @param excludeEvent The event to exclude from the checks
   * @param settings The guild Settings
   */
  async deleteAfterChecks(webhook: { id: string; token: string }, excludeEvent: string[], settings: GuildSchema) {
    const inUse = this.checkWebhookUsage(settings, webhook, excludeEvent);
    if (!inUse) {
      await this.client.api.webhooks.delete(webhook.id, { token: webhook.token }).catch(() => {});
    }
  }

  async disableAllReminders(settings: GuildSchema) {
    const events = Object.entries(settings.reminders.events).filter(([, e]) => e?.active && e?.webhook?.id);
    const webhooks = new Map<string, { id: string; token: string }>();

    // group common webhooks
    for (let [, event] of events) {
      if (!webhooks.has(event!.webhook!.id)) {
        webhooks.set(event!.webhook!.id, event!.webhook!);
      }
      event = null;
    }
    settings.reminders.active = false;
    await settings.save();

    for (const webhook of webhooks.values()) {
      await this.deleteAfterChecks(webhook, [], settings);
    }
  }
}
