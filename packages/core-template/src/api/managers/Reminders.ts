/* import type { GuildSchema } from "#libs"; */
import getSettings from "../utils/getSettings.js";
import type { SkyHelper as BotService } from "@/structures";
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

    return settings?.reminders?.active ? settings.reminders.events : null;
  }

  // TODO: this needs full revamp along with dashboard
  /* static async patch(client: BotService, guildId: string, body: any): Promise<ReminderFeature | null> {
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
  } */

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
    for (const event of Object.values(settings.reminders.events)) {
      if (event.webhook?.id) {
        await client.api.webhooks.delete(event.webhook.id, { token: event.webhook.token, reason: "Disabled" }).catch(() => {});
      }
      event.active = false;
      event.webhook = null;
      event.last_messageId = undefined;
    }

    settings.reminders.active = false;
    await settings.save();

    return "Success";
  }
}
