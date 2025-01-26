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

  static checkActive(settings: GuildSchema) {
    return Object.values(settings.reminders.events).some((e) => e.active);
  }

  private checkWebhookUsage(reminders: GuildSchema["reminders"], webhook: { id: string; token: string }, eventName: string) {
    const keys = Object.keys(reminders.events).filter((k) => k !== eventName);
    return keys.some((key) => reminders.events[key as keyof GuildSchema["reminders"]["events"]].webhook?.id === webhook.id);
  }

  async createWebhookAfterChecks(channelId: string, data: RESTPostAPIChannelWebhookJSONBody, reason?: string) {
    const channelWebhooks = await this.fetchWebhooks(channelId);
    const clientWebhook = channelWebhooks.find((w) => w.application_id === this.client.user.id);
    return clientWebhook || this.createWebhook(channelId, data, reason);
  }

  async deleteAfterChecks(webhook: { id: string; token: string }, eventName: string, settings: GuildSchema) {
    const inUse = this.checkWebhookUsage(settings.reminders, webhook, eventName);
    if (!inUse) {
      await this.client.api.webhooks.delete(webhook.id, { token: webhook.token });
    }
  }
}
