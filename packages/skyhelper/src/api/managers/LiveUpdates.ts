import embeds from "@/utils/classes/Embeds";
import getSettings from "../utils/getSettings.js";
import type { SkyHelper as BotService } from "@/structures";
import { getTranslator } from "@/i18n";
import { DateTime } from "luxon";
import RemindersUtils from "@/utils/classes/RemindersUtils";

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

    const webhooksToDelete = new Set<{ id: string; token: string }>();

    for (const [key, bodyKey] of [
      ["autoShard", "shards"],
      ["autoTimes", "times"],
    ] as const) {
      const type = data[key];

      if (body[bodyKey] === type.webhook.channelId) continue; // no changes, move to next loop

      const isChanged = body[bodyKey] && body[bodyKey] !== type.webhook.channelId; // channel changed

      // if there is channel in body, means its changed, not disabled
      if (isChanged) {
        const embed =
          bodyKey === "shards"
            ? embeds.buildShardEmbed(now, t, t("features:shards-embed.FOOTER"), true)
            : await embeds.getTimesEmbed(client, t, t("features:times-embed.FOOTER"));

        const newWebhook = await utils.createWebhookAfterChecks(
          body[bodyKey],
          { name: "Live Updates", avatar: client.utils.getUserAvatar(client.user) },
          "For Live updates",
        );

        const msg = await client.api.webhooks.execute(newWebhook.id, newWebhook.token!, {
          ...embed,
          wait: true,
          username: `${bodyKey === "times" ? "Times" : "Shards"} Updates`,
          allowed_mentions: { parse: [] },
        });

        // if there is an old webhook, add it for deletion
        if (type.webhook.id && type.webhook.token) {
          webhooksToDelete.add(type.webhook as { id: string; token: string });
        }

        Object.assign(type, {
          active: true,
          messageId: msg.id,
          webhook: { id: newWebhook.id, token: newWebhook.token!, channelId: newWebhook.channel_id },
        });

        // this means no channel, hence disabled
      } else {
        if (type.webhook.id && type.webhook.token) {
          // delete the message if it exists
          if (type.messageId) {
            await client.api.webhooks.deleteMessage(type.webhook.id, type.webhook.token, type.messageId).catch(() => {});
          }

          // add wb for deletion
          webhooksToDelete.add(type.webhook as { id: string; token: string });
        }

        // update the data
        Object.assign(type, {
          messageId: "",
          active: false,
          webhook: { id: null, token: null, channelId: null },
        });
      }
    }

    await data.save();

    // Handle webhook deletions
    for (const webhook of webhooksToDelete) {
      await utils.deleteAfterChecks(webhook, [], data).catch(() => {});
    }

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

    const utils = new RemindersUtils(client);
    const webhooksToDelete = new Map<string, { id: string; token: string }>();

    for (const key of ["autoShard", "autoTimes"] as const) {
      const { webhook, messageId } = data[key];

      if (messageId && webhook?.id && webhook?.token) {
        await client.api.webhooks.deleteMessage(webhook.id, webhook.token, messageId).catch(() => {});
      }

      if (webhook?.id) {
        webhooksToDelete.set(webhook.id, webhook as { id: string; token: string });
      }
      Object.assign(data[key], {
        active: false,
        messageId: "",
        webhook: { id: null, token: null, channelId: null },
      });
    }

    for (const webhook of webhooksToDelete.values()) {
      await utils.deleteAfterChecks(webhook, ["autoShard", "autoTimes"], data);
    }

    await data.save();
    return { shards: null, times: null };
  }
}
