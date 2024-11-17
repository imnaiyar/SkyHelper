import { REMINDERS_DATA } from "#bot/commands/commands-data/admin-commands";
import type { EventsKeys, GuildSchema } from "#bot/libs/types";
import type { Command, SkyHelper } from "#structures";
import { ChannelType, Routes, type GuildTextBasedChannel, type TextChannel, type Webhook } from "discord.js";

export default {
  ...REMINDERS_DATA,
  interactionRun: async (int, t, client) => {
    if (!int.inCachedGuild()) throw new Error("Somehow this command was ran outside of a guild");
    let resp = "";
    await int.deferReply();
    const sub = int.options.getSubcommand(true);
    const type = int.options.getString("event-type", true);
    switch (sub) {
      case "setup": {
        const channel = int.options.getChannel("channel", true);
        if (channel.type !== ChannelType.GuildText) throw new Error("Channel must be a text channel");
        const role = int.options.getRole("role");
        const settings = await client.database.getSettings(int.guild);
        const event = settings.reminders.events[type as EventsKeys];
        if (event.webhook.id && channel.id !== event.webhook.channelId) {
          await deleteWebhook(
            client,
            event.webhook.id,
            settings.reminders.events[type as EventsKeys].webhook.token ?? undefined,
          ).catch(() => {});
        }
        const wb = await checkBotsWb(channel, client);
        await enableEventReminder(type as EventsKeys, settings, wb, role?.id || null);
        resp = `Reminders for \`${type}\` have been set up in ${channel}.`;
        break;
      }
      case "role": {
        const role = int.options.getRole("role");
        const settings = await client.database.getSettings(int.guild);
        settings.reminders.events[type as EventsKeys].role = role?.id || null;
        resp = `Role to mention for \`${type}\` has been ${role ? "set to" + role : "disabled"}.`;
        break;
      }
      case "disable": {
        const settings = await client.database.getSettings(int.guild);
        const event = settings.reminders.events[type as EventsKeys];
        if (!event.active) {
          resp = `Reminders for \`${type}\` is already already disabled.`;
          break;
        }
        await disableEvent(type as EventsKeys, settings, client);
        resp = `Reminders for \`${type}\` have been disabled.`;
        break;
      }
    }

    await int.editReply(resp);
  },
} satisfies Command;

/**
 * Check if a channel has existing webhook by the bot and return that,
 * otherwise create a new one
 * @param channel The channel to check and create a webhook for
 * @param client The bot's client
 */
async function checkBotsWb(channel: TextChannel, client: SkyHelper): Promise<Webhook> {
  const wbs = await channel.fetchWebhooks();
  const botWb = wbs.find((wb) => wb.owner?.id === client.user?.id);
  if (!botWb) {
    return createWebhook(channel);
  }
  return botWb;
}

/**
 * Create a webhook in the given channel
 * @param channel The channel to create the webhook in
 * @param reason The reason for creating the webhook
 */
function createWebhook(channel: TextChannel, reason: string = "") {
  return channel.createWebhook({
    name: "SkyHelper Reminder",
    reason: reason ?? "For sending reminders",
    avatar: channel.client.user.displayAvatarURL(),
  });
}

/**
 * Delete a webhook by its ID and token
 * @param client The bot's client
 * @param wbId The webhook's ID
 * @param wbToken The webhook's token
 * @param reason The reason for deleting the webhook
 */
function deleteWebhook(client: SkyHelper, wbId: string, wbToken?: string, reason: string = "No longer needed") {
  return client.rest.delete(Routes.webhook(wbId, wbToken), { reason });
}

function enableEventReminder(event: EventsKeys, setting: GuildSchema, wb: Webhook, role: string | null) {
  setting.reminders.events[event] = {
    active: true,
    webhook: {
      id: wb.id,
      token: wb.token,
      channelId: wb.channelId,
    },
    role,
  };
  setting.reminders.active = true;
  return setting.save();
}

function disableEvent(event: EventsKeys, setting: GuildSchema, client:SkyHelper) {
  const eventSetting = setting.reminders.events[event];
  if (!eventSetting.active) return;
  if (eventSetting.webhook.id) {
    deleteWebhook(client, eventSetting.webhook.id, eventSetting.webhook.token ?? undefined).catch(() => {});
  }
  setting.reminders.events[event] = {
    active: false,
    webhook: {
      id: null,
      token: null,
      channelId: null,
    },
  };
  if (Object.values(setting.reminders.events).every((e) => !e.active)) {
    setting.reminders.active = false;
  }
  return setting.save();
}


function getEventReminderStatus(setting: GuildSchema) {

}