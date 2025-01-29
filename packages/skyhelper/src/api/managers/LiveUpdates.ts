import embeds from "@/utils/classes/Embeds";
import getSettings from "../utils/getSettings.js";
import type { SkyHelper as BotService } from "@/structures";
import { getTranslator } from "@/i18n";
import { DateTime } from "luxon";
import RemindersUtils from "@/utils/classes/RemindersUtils";
import type { APIWebhook } from "@discordjs/core";

export class LiveUpdates {
  static async get(client: BotService, guildId: string) {
    const settings = await getSettings(client, guildId);
    if (!settings) return { shards: null, times: null };
    const obj: Record<"shards" | "times", string | null> = { shards: null, times: null };
    for (const [v, key] of [
      ["shards", "autoShard"],
      ["times", "autoTimes"],
    ] as const) {
      if (!settings[key].active || !settings[key].webhook.id) continue;
      const wb = await client.api.webhooks.get(settings[key].webhook.id, { token: settings[key].webhook.token! }).catch(() => {});
      if (!wb) continue;
      obj[v] = wb.channel_id;
    }
    return obj;
  }
  static async patch(client: BotService, guildId: string, body: any) {
    const data = await getSettings(client, guildId);
    if (!data) return null;
    const utils = new RemindersUtils(client);
    const now = DateTime.now().setZone(client.timezone);
    const t = getTranslator(data.language?.value ?? "en-US");
    const wbs: Map<APIWebhook, ("autoTimes" | "autoShard")[]> = new Map();
    for (const [v, key] of [
      ["shards", "autoShard"],
      ["times", "autoTimes"],
    ] as const) {
      const type = data[key];
      const wb = type.webhook.id
        ? await client.api.webhooks.get(type.webhook.id, { token: data[key].webhook.token! }).catch(() => null)
        : null;
      if (body[v] && body[v] !== wb?.channel_id) {
        // prettier-ignore
        if (data[key].messageId && wb) await client.api.webhooks.deleteMessage(wb.id, wb.token!, data[key].messageId).catch(() => {});
        const response =
          v === "times"
            ? await embeds.getTimesEmbed(client, t)
            : embeds.buildShardEmbed(now, t, t("features:shards-embed.FOOTER"), true);
        const wb2 = await utils.createWebhookAfterChecks(
          body[v],
          { name: "Live Updates", avatar: client.utils.getUserAvatar(client.user) },
          "For Live updates",
        );
        const msg = await client.api.webhooks.execute(wb2.id, wb2.token!, {
          ...response,
          wait: true,
          username: `${v === "times" ? "Times" : "Shards"} Updates`,
          allowed_mentions: { parse: [] },
        });
        if (wb) wbs.has(wb) ? wbs.get(wb)!.push(key) : wbs.set(wb, [key]);
        data[key].messageId = msg.id;
        data[key].active = true;
        data[key].webhook = { id: wb2.id, token: wb2.token!, channelId: wb2.channel_id };
      } else {
        if (data[key].messageId && wb) {
          await client.api.webhooks.deleteMessage(wb.id, wb.token!, data[key].messageId).catch(() => {});
        }
        if (wb) wbs.has(wb) ? wbs.get(wb)!.push(key) : wbs.set(wb, [key]);
        data[key].messageId = "";
        data[key].webhook = { id: null, token: null, channelId: null };
        data[key].active = false;
      }
      for (const webhook of wbs.keys()) {
        await utils.deleteAfterChecks(webhook as Required<typeof webhook>, wbs.get(webhook)!, data);
      }
    }
    await data.save();
    return { shards: data.autoShard.webhook.channelId, times: data.autoTimes.webhook.channelId };
  }
  static async post(client: BotService, guildId: string) {
    const data = await getSettings(client, guildId);
    if (!data) return null;
    data.autoShard.active = true;
    data.autoTimes.active = true;
    await data.save();
    return "Success";
  }
  static async delete(client: BotService, guildId: string): Promise<any> {
    const data = await getSettings(client, guildId);
    if (!data || !data.autoShard.active) return "Success";
    const wbs: Map<string, APIWebhook> = new Map();
    for (const key of ["autoShard", "autoTimes"] as const) {
      data[key].active = false;
      const web = data[key].webhook;
      if (!web) continue;
      const wb = await client.api.webhooks.get(web.id!, { token: web.token! });
      if (data[key].messageId) await client.api.webhooks.deleteMessage(wb.id, wb.token!, data[key].messageId).catch(() => {});
      if (!wbs.has(wb.id)) wbs.set(wb.id, wb);
      data[key].webhook = { id: null, token: null, channelId: null };
      data[key].messageId = "";
    }
    for (const wb of wbs.values()) {
      await new RemindersUtils(client).deleteAfterChecks(wb as Required<typeof wb>, ["autoShard", "autoTimes"], data);
    }
    await data.save();
    return { shards: null, times: null };
  }
}
