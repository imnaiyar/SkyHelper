import type { Event } from "@/structures";
import type { GatewayDispatchEvents } from "@discordjs/core";
import type { EventReminder, LiveUpdates } from "@/types/schemas";

const handler: Event<GatewayDispatchEvents.WebhooksUpdate> = async (client, { data: { channel_id, guild_id } }) => {
  const guild = client.guilds.get(guild_id)!;
  const guildSettings = await client.schemas.getSettings(guild);
  const channelWebhooks = await client.api.channels.getWebhooks(channel_id).catch(() => null);

  if (!channelWebhooks) return;

  const existingWebhookIds = new Set(channelWebhooks.map((webhook) => webhook.id));

  const disabledEvents: string[] = [];

  // group events with their keys
  const targets: [string, LiveUpdates | EventReminder][] = [
    ...Object.entries(guildSettings.reminders.events),
    ...(["autoShard", "autoTimes"] as const).map((key) => [key, guildSettings[key]] as [string, LiveUpdates]),
  ];

  // map to check if any has been disabled
  // eslint-disable-next-line prefer-const
  for (let [key, entry] of targets) {
    if (entry?.webhook?.id && entry.webhook.channelId === channel_id && !existingWebhookIds.has(entry.webhook.id)) {
      if ("messageId" in entry) entry = { active: false, messageId: "null", webhook: { id: null, token: null, channelId: null } };
      else entry = null;
      disabledEvents.push(key);
    }
  }

  if (!disabledEvents.length) return;

  await guildSettings.save();
  client.logger.warn(
    `Following event reminders were disabled due to webhook deletion: ${disabledEvents.join(", ")} for ${guild.name}`,
  );
};

export default handler;
