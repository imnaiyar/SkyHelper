import type { Event } from "@/structures";
import type { LiveUpdates } from "@/types/schemas";
import RemindersUtils from "@/utils/classes/RemindersUtils";
import type { GatewayDispatchEvents } from "@discordjs/core";

// only listened to check if live update message was deleted and disable if it is
const handler: Event<GatewayDispatchEvents.MessageDelete> = async (client, { data: message }) => {
  if (!message.guild_id) return;
  const guild = client.guilds.get(message.guild_id);
  if (!guild) return;
  const guildSettings = await client.schemas.getSettings(guild);
  const hasActive = (["autoShard", "autoTimes"] as const)
    .map((key) => [key, guildSettings[key]])
    .find(([_k, v]) => (v as LiveUpdates).messageId === message.id);
  if (!hasActive) return;
  const [key, value] = hasActive as ["autoShard" | "autoTimes", LiveUpdates];
  await new RemindersUtils(client).deleteAfterChecks(
    value.webhook as { id: string; token: string; channelId: string },
    [key],
    guildSettings,
  );
  guildSettings[key] = {
    active: false,
    webhook: { id: null, token: null, channelId: null },
    messageId: "null",
  };
  await guildSettings.save();
  client.logger.error(`Event reminder ${key} was disabled due to message deletion for ${guild.name}`);
};

export default handler;
