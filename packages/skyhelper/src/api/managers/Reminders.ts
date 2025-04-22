/* import type { GuildSchema } from "#libs"; */
import getSettings from "../utils/getSettings.js";
import type { SkyHelper as BotService } from "@/structures";
import type { ReminderFeature } from "../types.js";
import RemindersUtils from "@/utils/classes/RemindersUtils";
import { REMINDERS_KEY } from "@/utils/constants";
import { HttpException, HttpStatus } from "@nestjs/common";
import type { GuildSchema } from "@/types/schemas";
/* const payload = (r: GuildSchema["reminders"]) => ({
  channel: r.webhook.channelId ?? undefined,
  default_role: r.default_role ?? undefined,
  geyser: r.geyser.active,
  grandma: r.grandma.active,
  turtle: r.turtle.active,
  reset: r.reset.active,
}); */

const formatReminders = (r: GuildSchema["reminders"]) => {
  const obj = Object.entries(r.events).reduce(
    (acc, [key, value]) => {
      acc[key as (typeof REMINDERS_KEY)[number]] = {
        active: value.active,
        channelId: value.webhook?.channelId ?? null,
        role: value.role ?? null,
        offset: value.offset ?? null,
      };
      return acc;
    },
    {} as Record<
      (typeof REMINDERS_KEY)[number],
      { active: boolean; channelId: string | null; role: string | null; offset: number | null }
    >,
  );
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
    for (const [key, value] of Object.entries(body)) {
      const event = settings.reminders.events[key as (typeof REMINDERS_KEY)[number]];
      if (!event) continue;

      event.active = value.active;

      if (value.active) {
        if (!value.channelId) {
          throw new HttpException("ChannelId must be present for active events.", HttpStatus.BAD_REQUEST);
        }
        event.role = value.role ?? null;
        event.offset = value.offset ?? null;
        settings.reminders.active = true; // mark reminder as active as at one event is active

        if (event.webhook?.channelId === value.channelId) continue; // No change, skip

        // If channel changed or webhook is missing, create a new one
        const wb = await utils.createWebhookAfterChecks(value.channelId, {
          name: "SkyHelper",
          avatar: client.utils.getUserAvatar(client.user),
        });

        if (!wb.token) throw new Error("Failed to create webhook, token is missing.");

        if (event.webhook) {
          webhooksToDelete.add(event.webhook);
        }

        event.webhook = { id: wb.id, token: wb.token, channelId: value.channelId };
      } else {
        if (event.webhook) {
          webhooksToDelete.add(event.webhook);
        }

        Object.assign(event, {
          webhook: null,
          role: null,
          last_messageId: null,
          offset: null,
          active: false,
        });
      }
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
