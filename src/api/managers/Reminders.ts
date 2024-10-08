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
    if (settings?.reminders.webhook.id && !settings.reminders.webhook.channelId) {
      const wb = await client.fetchWebhook(settings.reminders.webhook.id).catch(() => null);
      if (wb) settings.reminders.webhook.channelId === wb.channelId;
      await settings.save();
    }

    return settings?.reminders?.active
      ? {
          ...settings.reminders,
          default_role: settings.reminders.default_role ?? undefined,
          channel: settings.reminders.webhook.channelId ?? undefined,
        }
      : null;
  }

  static async patch(client: BotService, guildId: string, body: any): Promise<ReminderFeature | null> {
    const settings = await getSettings(client, guildId);

    if (!settings) {
      return null;
    }
    settings.reminders.geyser = body.geyser;
    settings.reminders.default_role = body.default_role;
    settings.reminders.grandma = body.grandma;
    settings.reminders.turtle = body.turtle;
    settings.reminders.reset = body.reset;
    settings.reminders.eden = body.eden;

    const channel = client.channels.cache.get(body.channel) as TextChannel;
    const updateWebhook = async (existingId?: string) => {
      if (existingId) {
        const wb = await client.fetchWebhook(existingId).catch(() => {});
        if (settings.reminders.webhook.channelId !== body.channel) {
          wb && wb.delete().catch(() => {});
        } else if (wb) {
          return;
        }
      }
      if (channel) {
        const webhook = await channel.createWebhook({
          name: "SkyHelper Reminders",
          reason: "For skytimes reminders",
          avatar: client.user.displayAvatarURL(),
        });
        settings.reminders.webhook = {
          id: webhook.id,
          token: webhook.token,
          channelId: webhook.channelId,
        };
      } else {
        settings.reminders.webhook = {
          id: null,
          token: null,
          channelId: null,
        };
      }
    };
    if (settings.reminders.webhook?.id) {
      await updateWebhook(settings.reminders.webhook.id);
    } else {
      await updateWebhook();
    }

    await settings.save();

    return {
      ...settings.reminders,
      default_role: settings.reminders.default_role ?? undefined,
      channel: settings.reminders.webhook.channelId ?? undefined,
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
