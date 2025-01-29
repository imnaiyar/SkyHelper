import type { Event } from "@/structures";
import type { GatewayDispatchEvents } from "@discordjs/core";
import type { GuildSchema, LiveUpdates } from "@/types/schemas";

// only listened to check if a webhook used by client is deleted
const handler: Event<GatewayDispatchEvents.WebhooksUpdate> = async (client, { data: { channel_id, guild_id } }) => {
  const guild = client.guilds.get(guild_id)!;
  const guildSettings = await client.schemas.getSettings(guild);
  const channelWebhooks = await client.api.channels.getWebhooks(channel_id).catch(() => null);

  if (!channelWebhooks) return;

  // Get all event reminders with the same channelId
  const reminders = Object.entries(guildSettings.reminders.events).filter(
    ([_k, event]) => event.webhook?.channelId === channel_id,
  );
  const liveUpdates = (["autoShard", "autoTimes"] as const)
    .map((key) => [key, guildSettings[key]])
    .filter(([_, value]) => (value as LiveUpdates).webhook.channelId === channel_id);

  // Group reminders by their webhook id
  const groupedReminders = Map.groupBy(reminders, ([_e, reminder]) => reminder.webhook?.id);
  const groupedLiveUpdates = Map.groupBy(liveUpdates, ([_e, liveUpdate]) => (liveUpdate as LiveUpdates).webhook.id);
  const disabledReminders: string[] = [];

  // Check if any grouped webhooks do not exist in the fetched webhooks for reminders
  const existingWebhookIds = new Set(channelWebhooks.map((webhook) => webhook.id));

  for (const [webhookId, rem] of groupedReminders) {
    if (webhookId && !existingWebhookIds.has(webhookId)) {
      // Disable all matching events
      rem.forEach(([event, _]) => {
        guildSettings.reminders.events[event as keyof GuildSchema["reminders"]["events"]] = {
          active: false,
          webhook: null,
          role: null,
          last_messageId: null,
        };
        disabledReminders.push(event);
      });
    }
  }

  for (const [webhookId, liveUpdate] of groupedLiveUpdates) {
    if (webhookId && !existingWebhookIds.has(webhookId)) {
      // Disable all matching events
      liveUpdate.forEach(([key, _]) => {
        guildSettings[key as "autoTimes" | "autoShard"] = {
          active: false,
          webhook: { id: null, token: null, channelId: null },
          messageId: "null",
        };
        disabledReminders.push(key as string);
      });
    }
  }
  if (disabledReminders.length === 0) return;

  // Save the updated guild settings
  await guildSettings.save();
  client.logger.error(
    `Following event reminders were disabled due to webhook deletion: ${disabledReminders.join(", ")} for ${guild.name}`,
  );
};

export default handler;
