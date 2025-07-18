/* import type { GuildSchema } from "#libs"; */
import getSettings from "../utils/getSettings.js";
import type { SkyHelper as BotService } from "@/structures";
import type { ReminderFeature } from "../types.js";
import RemindersUtils from "@/utils/classes/RemindersUtils";
import { REMINDERS_KEY } from "@skyhelperbot/constants";
import { HttpException, HttpStatus } from "@nestjs/common";
import type { GuildSchema, ReminderConfigWithShards } from "@/types/schemas";
/* const payload = (r: GuildSchema["reminders"]) => ({
  channel: r.webhook.channelId ?? undefined,
  default_role: r.default_role ?? undefined,
  geyser: r.geyser.active,
  grandma: r.grandma.active,
  turtle: r.turtle.active,
  reset: r.reset.active,
}); */

const formatReminders = (r: GuildSchema["reminders"]) => {
  const obj = Object.entries(r.events).reduce((acc, [key, value]) => {
    // @ts-expect-error
    acc[key as (typeof REMINDERS_KEY)[number]] = {
      active: value?.active || false,
      channelId: value?.webhook?.channelId ?? null,
      role: value?.role ?? null,
      offset: value?.offset ?? null,
    };

    if (key === "shards-eruption") {
      // @ts-expect-error id have patience to deal with this, it is just present
      acc[key].shard_type = value?.shard_type ?? null;
    }
    return acc;
  }, {} as ReminderFeature);
  return obj;
};
export class Reminders {
  static async get(client: BotService, guildId: string): Promise<ReminderFeature> {
    const settings = await getSettings(client, guildId);

    return formatReminders(settings!.reminders);
  }

  static async patch(client: BotService, guildId: string, body: ReminderFeature): Promise<ReminderFeature | null> {
    const settings = await getSettings(client, guildId);
    if (!settings) return null;

    const utils = new RemindersUtils(client);
    const webhooksToDelete = new Set<{ id: string; token: string }>();
    for (const [k, value] of Object.entries(body)) {
      const key = k as (typeof REMINDERS_KEY)[number];
      const event = settings.reminders.events[key];

      if (!value.active) {
        if (event?.webhook) webhooksToDelete.add(event.webhook);

        settings.reminders.events[key as (typeof REMINDERS_KEY)[number]] = null;

        continue;
      }

      if (!value.channelId) {
        throw new HttpException("ChannelId must be present for active events.", HttpStatus.BAD_REQUEST);
      }

      const data = {
        active: true,
        last_messageId: null,
        ...event,
        role: value.role ?? null,
        offset: value.offset ?? null,
      } as ReminderConfigWithShards;

      if (key === "shards-eruption") data.shard_type = body["shards-eruption"].shard_type ?? ["red", "black"];

      settings.reminders.active = true; // mark reminder as active as at one event is active

      settings.reminders.events[key] = data;

      if (data.webhook?.channelId === value.channelId) continue; // No change, skip

      // If channel changed or webhook is missing, create a new one
      const wb = await utils.createWebhookAfterChecks(value.channelId, {
        name: "SkyHelper",
        avatar: client.utils.getUserAvatar(client.user),
      });

      if (!wb.token) throw new Error("Failed to create webhook, token is missing.");

      if (event?.webhook) {
        webhooksToDelete.add(event.webhook);
      }

      settings.reminders.events[key]!.webhook = { id: wb.id, token: wb.token, channelId: value.channelId };
    }

    const isAnyActive = RemindersUtils.checkActive(settings);
    if (!isAnyActive) settings.reminders.active = false;
    await settings.save();

    for (const webhook of webhooksToDelete) {
      await utils.deleteAfterChecks(webhook, [], settings).catch(() => {});
    }

    return formatReminders(settings.reminders);
  }

  static async post(client: BotService, guildId: string) {
    const settings = await getSettings(client, guildId);

    if (!settings) {
      return null;
    }

    settings.reminders.active = true;
    await settings.save();

    return "Success";
  }

  static async delete(client: BotService, guildId: string): Promise<"Success"> {
    const settings = await getSettings(client, guildId);

    if (!settings) {
      return "Success";
    }
    await new RemindersUtils(client).disableAllReminders(settings);

    return "Success";
  }
}
