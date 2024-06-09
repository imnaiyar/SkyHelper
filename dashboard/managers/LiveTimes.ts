import { getEventEmbed } from "#handlers";
import type { SkyHelper as BotService } from "#structures";
import getSettings from "../utils/getSettings.js";
import type { TextChannel, WebhookMessageCreateOptions } from "discord.js";

export class LiveTimes {
  static async get(client: BotService, guildId: string) {
    const settings = await getSettings(client, guildId);
    if (!settings) return null;
    if (!settings.autoTimes.active) return null;
    if (!settings.autoTimes.webhook.id) return JSON.stringify({ channel: undefined });
    const wb = await client.fetchWebhook(settings.autoTimes.webhook.id).catch(() => {});
    if (!wb) return { channel: undefined };
    return { channel: wb.channelId };
  }
  static async patch(client: BotService, guildId: string, body: any) {
    const data = await getSettings(client, guildId);
    if (!data) return null;
    const embed = await getEventEmbed(client);
    const response: WebhookMessageCreateOptions = { embeds: [embed] };
    if (data.autoTimes.webhook.id) {
      const wb = await client.fetchWebhook(data.autoTimes.webhook.id).catch(() => {});
      if (wb) {
        const msg = await wb.fetchMessage(data.autoTimes.messageId!).catch(() => {});
        if (wb.channelId === body.channel) {
          if (!msg) {
            const m = await wb.send({ username: "SkyHelper", avatarURL: client.user.displayAvatarURL(), ...response });
            data.autoTimes.messageId = m.id;
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
      reason: "For Live Skytimes",
    });
    const m = await wb2.send({ username: "SkyHelper", avatarURL: client.user.displayAvatarURL(), ...response });
    data.autoTimes.messageId = m.id;
    data.autoTimes.active = true;
    data.autoTimes.webhook.id = wb2.id;
    data.autoTimes.webhook.token = wb2.token;
    await data.save();
    return { channel: wb2.channelId };
  }
  static async post(client: BotService, guildId: string) {
    const data = await getSettings(client, guildId);
    if (!data) return null;
    data.autoTimes.active = true;
    await data.save();
    return "Success";
  }
  static async delete(client: BotService, guildId: string): Promise<"Success"> {
    const data = await getSettings(client, guildId);
    if (!data || !data.autoTimes.webhook.id) return "Success";

    const wb = await client.fetchWebhook(data.autoTimes.webhook.id).catch(() => {});
    if (wb) {
      const msg = await wb.fetchMessage(data.autoTimes.messageId!).catch(() => {});
      if (msg) await wb.deleteMessage(msg).catch(() => {});
      await wb.delete();
    }
    data.autoTimes.active = false;
    data.autoTimes.messageId = "";
    data.autoTimes.webhook.id = null;
    data.autoTimes.webhook.token = null;
    await data.save();
    return "Success";
  }
}
