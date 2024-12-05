/* import type { GuildSchema } from "#libs"; */
import getSettings from "../utils/getSettings.js";
import type { TextChannel } from "discord.js";
import type { SkyHelper as BotService } from "#structures";
import type { ReminderFeature } from "../types.js";
/* const payload = (r: GuildSchema["reminders"]) => ({
  channel: r.webhook.channelId ?? undefined,
  default_role: r.default_role ?? undefined,
  geyser: r.geyser.active,
  grandma: r.grandma.active,
  turtle: r.turtle.active,
  reset: r.reset.active,
}); */

export class Reminders {
  static async get(client: BotService, guildId: string): Promise<ReminderFeature | null> {
    const settings = await getSettings(client, guildId);

    return settings?.reminders.active
      ? {
          active: settings.reminders.active,
          events: {
            ...Object.entries(settings.reminders.events).reduce(
              (acc, [key, value]) => {
                acc[key as keyof typeof settings.reminders.events] = {
                  active: value.active,
                  channel: value.webhook.channelId ?? undefined,
                  role: value.role ?? undefined,
                };
                return acc;
              },
              {} as Record<
                keyof typeof settings.reminders.events,
                ReminderFeature["events"][keyof typeof settings.reminders.events]
              >,
            ),
          },
        }
      : null;
  }

  static async patch(client: BotService, guildId: string, body: any): Promise<ReminderFeature | null> {
    const settings = await getSettings(client, guildId);

    if (!settings) {
      return null;
    }
    const reminders = settings.reminders;
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
    if (!settings.reminders?.webhook?.id) {
      settings.reminders.active = false;
      await settings.save();
      return "Success";
    }
    try {
      (await client.fetchWebhook(settings.reminders.webhook.id)).delete();
    } catch (error) {
      console.error("Error deleting webhook:", error);
    }

    settings.reminders.active = false;
    await settings.save();

    return "Success";
  }
}
