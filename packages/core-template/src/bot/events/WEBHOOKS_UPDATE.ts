import type { Event } from "@/structures";
import type { GatewayDispatchEvents } from "@discordjs/core";
import type { GuildSchema } from "@/types/schemas";

// only listened to check if a webhook used by client is deleted
const handler: Event<GatewayDispatchEvents.WebhooksUpdate> = async (client, { data: { channel_id, guild_id } }) => {
  const guild = client.guilds.get(guild_id)!;
  const guildSettings = await client.schemas.getSettings(guild);
  const channelWebhooks = await client.api.channels.getWebhooks(channel_id);

  // Get all event reminders with the same channelId
  const reminders = Object.entries(guildSettings.reminders.events).filter(
    ([_k, event]) => event.webhook?.channelId === channel_id,
  );

  // Group reminders by their webhook id
  const groupedReminders = Map.groupBy(reminders, ([_e, reminder]) => reminder.webhook?.id);
  const disabledReminders: string[] = [];
  // Check if any grouped webhooks do not exist in the fetched webhooks
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
  if (disabledReminders.length === 0) return;

  // Save the updated guild settings
  await guildSettings.save();
  client.logger.error(
    `Following reminders were disabled due to webhook deletion: ${disabledReminders.join(", ")} for ${guild.name}`,
  );
};

export default handler;
