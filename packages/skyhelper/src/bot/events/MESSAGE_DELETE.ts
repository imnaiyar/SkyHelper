import type { Event } from "@/structures";
import RemindersUtils from "@/utils/classes/RemindersUtils";
import type { GatewayDispatchEvents } from "@discordjs/core";

// only listened to check if live update message was deleted and disable if it is
const handler: Event<GatewayDispatchEvents.MessageDelete> = async (client, { data: message }) => {
  if (!message.guild_id) return;
  const guild = client.guilds.get(message.guild_id);
  if (!guild) return;

  const guildSettings = await client.schemas.getSettings(guild);

  const hasActive = (["autoShard", "autoTimes"] as const).find((key) => guildSettings[key].messageId === message.id);

  if (!hasActive) return;

  const utils = new RemindersUtils(client);
  const liveUpdate = guildSettings[hasActive];

  await utils
    .deleteAfterChecks(liveUpdate.webhook as { id: string; token: string; channelId: string }, [hasActive], guildSettings)
    .catch(() => {});

  Object.assign(liveUpdate, {
    active: false,
    webhook: { id: null, token: null, channelId: null },
    messageId: "",
  });

  await guildSettings.save();
  client.logger.warn(`Event reminder ${hasActive} was disabled due to message deletion for ${guild.name}`);
};

export default handler;
