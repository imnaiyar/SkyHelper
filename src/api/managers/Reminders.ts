/* import type { GuildSchema } from "#libs"; */
import getSettings from "../utils/getSettings.js";
import { RemindersUtils as utils } from "#bot/utils/RemindersUtils";
import type { SkyHelper as BotService } from "#structures";
import type { ReminderFeature } from "../types.js";
import type { EventsKeys, GuildSchema } from "#bot/libs/types";
import type { TextChannel } from "discord.js";

// formats the events object to the required format
const formatEvents = (events: GuildSchema["reminders"]["events"]) =>
  Object.entries(events).reduce(
    (acc, [key, value]) => {
      acc[key as keyof typeof events] = {
        active: value.active,
        channel: value.webhook.channelId ?? undefined,
        role: value.role ?? undefined,
      };
      return acc;
    },
    {} as Record<keyof typeof events, ReminderFeature[keyof typeof events]>,
  );

async function handleReminderPatch(
  eventName: EventsKeys,
  data: { active: boolean; channel?: string; role?: string | null },
  settings: GuildSchema,
  client: BotService,
) {
  const event = settings.reminders.events[eventName];
  if (!data.active && event.active) {
    return utils.disableEvent(eventName, settings, client);
  }
  if (!data.active && !event.active) return settings;

  if (event.webhook.id && data.channel !== event.webhook.channelId) {
    await utils.deleteWebhook(client, event.webhook, settings.reminders.events, eventName, true)?.catch(() => {});
  }
  const channel = client.channels.cache.get(data.channel!) as TextChannel;
  const wb = await utils.checkBotsWb(channel, client);

  return utils.enableEventReminder(eventName, settings, wb, data.role || null);
}

export class Reminders {
  static async get(client: BotService, guildId: string): Promise<ReminderFeature | null> {
    const settings = await getSettings(client, guildId);

    return settings?.reminders.active
      ? {
          ...formatEvents(settings.reminders.events),
        }
      : null;
  }

  static async patch(client: BotService, guildId: string, body: ReminderFeature): Promise<ReminderFeature | null> {
    const settings = await getSettings(client, guildId);

    if (!settings) {
      return null;
    }

    for (const [event, data] of Object.entries(body)) {
      await handleReminderPatch(event as EventsKeys, data, settings, client);
    }
    return {
      ...formatEvents(settings.reminders.events),
    };
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
    await utils.disableAll(settings, client);

    return "Success";
  }
}
