import embeds from "@/utils/classes/Embeds";
import getSettings from "../utils/getSettings.js";
import type { SkyHelper as BotService } from "@/structures";
import { getTranslator } from "@/i18n";
import RemindersUtils from "@/utils/classes/RemindersUtils";
import type { APITextChannel } from "@discordjs/core";

export class LiveTimes {
  static async get(client: BotService, guildId: string) {
    const settings = await getSettings(client, guildId);
    if (!settings) return null;
    if (!settings.autoTimes.active) return null;
    if (!settings.autoTimes.webhook.id) return { channel: undefined };
    const wb = await client.api.webhooks
      .get(settings.autoTimes.webhook.id, { token: settings.autoTimes.webhook.token! })
      .catch(() => {});
    if (!wb) return { channel: undefined };
    return { channel: wb.channel_id };
  }
  static async patch(client: BotService, guildId: string, body: any) {
    const data = await getSettings(client, guildId);
    if (!data) return null;
    const t = getTranslator(data.language?.value ?? "en-US");
    const response = { ...(await embeds.getTimesEmbed(client, t)), components: undefined };
    if (data.autoTimes.webhook.id) {
      const wb = await client.api.webhooks
        .get(data.autoTimes.webhook.id, { token: data.autoTimes.webhook.token! })
        .catch(() => {});
      if (wb) {
        const msg = await client.api.webhooks.getMessage(wb.id, wb.token!, data.autoTimes.messageId!).catch(() => {});
        if (wb.channel_id === body.channel) {
          if (!msg) {
            const m = await client.api.webhooks.execute(wb.id, wb.token!, {
              username: "SkyHelper",
              avatar_url: client.utils.getUserAvatar(client.user),
              wait: true,
              ...response,
            });
            data.autoTimes.messageId = m.id;
            await data.save();
          }
          return { channel: wb.channel_id };
        } else {
          if (msg) await client.api.webhooks.deleteMessage(wb.id, wb.token!, msg.id).catch(() => {});
          await new RemindersUtils(client).deleteAfterChecks(wb as Required<typeof wb>, "", data);
        }
      }
    }
    let channel,
      wb2 = null;
    if (body.channel) {
      channel = client.channels.get(body.channel)! as APITextChannel;
      wb2 = await client.api.channels.createWebhook(
        channel.id,
        {
          name: "SkyHelper",
          avatar: client.utils.getUserAvatar(client.user),
        },
        { reason: "For Live Skytimes" },
      );
    }
    const m = await client.api.webhooks.execute(wb2!.id, wb2!.token!, {
      username: "SkyHelper",
      avatar_url: client.utils.getUserAvatar(client.user),
      wait: true,
      ...response,
    });
    data.autoTimes.messageId = m?.id || "";
    data.autoTimes.active = wb2 ? true : false;
    data.autoTimes.webhook = {
      id: wb2?.id || null,
      token: wb2?.token || null,
    };
    await data.save();
    return { channel: wb2?.channel_id };
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
    if (!data || !data.autoTimes.active) return "Success";
    data.autoTimes.active = false;
    const wb =
      data.autoTimes.webhook.id &&
      (await client.api.webhooks.get(data.autoTimes.webhook.id, { token: data.autoTimes.webhook.token! }));
    if (wb) {
      const msg = await client.api.webhooks.getMessage(wb.id, wb.token!, data.autoTimes.messageId!).catch(() => {});
      if (msg) await client.api.webhooks.deleteMessage(wb.id, wb.token!, msg.id).catch(() => {});
      await new RemindersUtils(client).deleteAfterChecks(wb as Required<typeof wb>, "", data);
    }
    data.autoTimes.messageId = "";
    data.autoTimes.webhook.id = null;
    data.autoTimes.webhook.token = null;
    await data.save();
    return "Success";
  }
}
