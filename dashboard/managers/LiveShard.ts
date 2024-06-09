import { buildShardEmbed } from "#handlers";
import moment from "moment";
import getSettings from "../utils/getSettings.js";
import type { TextChannel } from "discord.js";
import type { SkyHelper as BotService } from "#structures";

export class LiveShard {
  static async get(client: BotService, guildId: string) {
    const settings = await getSettings(client, guildId);
    if (!settings) return null;
    if (!settings.autoShard.active) return null;
    if (!settings.autoShard.webhook.id) return JSON.stringify({ channel: undefined });
    const wb = await client.fetchWebhook(settings.autoShard.webhook.id).catch(() => {});
    if (!wb) return { channel: undefined };
    return { channel: wb.channelId };
  }
  static async patch(client: BotService, guildId: string, body: any) {
    const data = await getSettings(client, guildId);
    if (!data) return null;
    const now = moment().tz(client.timezone);
    const response = buildShardEmbed(now, "Live Shard (updates every 5 min.)", true);
    if (data.autoShard.webhook.id) {
      const wb = await client.fetchWebhook(data.autoShard.webhook.id).catch(() => {});
      if (wb) {
        const msg = await wb.fetchMessage(data.autoShard.messageId!).catch(() => {});
        if (wb.channelId === body.channel) {
          if (!msg) {
            const m = await wb.send({ username: "SkyHelper", avatarURL: client.user.displayAvatarURL(), ...response });
            data.autoShard.messageId = m.id;
            await data.save();
          }
          return { channel: wb.channelId };
        } else {
          if (msg) await wb.deleteMessage(msg).catch(() => {});
          await wb.delete().catch(() => {});
        }
      }
    }
    const channel = client.channels.cache.get(body.channel)! as TextChannel;
    const wb2 = await channel.createWebhook({
      name: "SkyHelper",
      reason: "For Live SHards",
    });
    const m = await wb2.send({ username: "SkyHelper", avatarURL: client.user.displayAvatarURL(), ...response });
    data.autoShard.messageId = m.id;
    data.autoShard.active = true;
    data.autoShard.webhook.id = wb2.id;
    data.autoShard.webhook.token = wb2.token;
    await data.save();
    return { channel: wb2.channelId };
  }
  static async post(client: BotService, guildId: string) {
    const data = await getSettings(client, guildId);
    if (!data) return null;
    data.autoShard.active = true;
    await data.save();
    return "Success";
  }
  static async delete(client: BotService, guildId: string): Promise<"Success"> {
    const data = await getSettings(client, guildId);
    if (!data || !data.autoShard.webhook.id) return "Success";

    const wb = await client.fetchWebhook(data.autoShard.webhook.id).catch(() => {});
    if (wb) {
      const msg = await wb.fetchMessage(data.autoShard.messageId!).catch(() => {});
      if (msg) await wb.deleteMessage(msg).catch(() => {});
      await wb.delete();
    }
    data.autoShard.active = false;
    data.autoShard.messageId = "";
    data.autoShard.webhook.id = null;
    data.autoShard.webhook.token = null;
    await data.save();
    return "Success";
  }
}
