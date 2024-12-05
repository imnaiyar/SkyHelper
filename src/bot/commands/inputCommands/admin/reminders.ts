import { REMINDERS_DATA } from "#bot/commands/commands-data/admin-commands";
import type { EventsKeys } from "#bot/libs/types";
import type { Command } from "#structures";
import { RemindersUtils as utils } from "#bot/utils/RemindersUtils";
import { ChannelType, type InteractionEditReplyOptions } from "discord.js";

export default {
  ...REMINDERS_DATA,
  interactionRun: async (int, _t, client) => {
    if (!int.inCachedGuild()) throw new Error("Somehow this command was ran outside of a guild");
    let resp: string | InteractionEditReplyOptions = "";
    await int.deferReply();
    const settings = await client.database.getSettings(int.guild);
    const sub = int.options.getSubcommand(true);
    const type = int.options.getString("event-type", true);
    switch (sub) {
      case "setup": {
        const channel = int.options.getChannel("channel");
        if (!channel) {
          const event = settings.reminders.events[type as EventsKeys];
          if (!event.active) {
            resp = `Reminders for \`${type}\` is already already disabled.`;
            break;
          }
          await utils.disableEvent(type as EventsKeys, settings, client);
          resp = `Reminders for \`${type}\` have been disabled.`;
          break;
        }
        if (channel.type !== ChannelType.GuildText) throw new Error("Channel must be a text channel");
        const role = int.options.getRole("role");
        const event = settings.reminders.events[type as EventsKeys];

        const events = settings.reminders.events;
        if (event.webhook.id && channel.id !== event.webhook.channelId) {
          await utils.deleteWebhook(client, event.webhook, events, type)?.catch(() => {});
        }
        const wb = await utils.checkBotsWb(channel, client);
        await utils.enableEventReminder(type as EventsKeys, settings, wb, role?.id || null);
        resp = `Reminders for \`${type}\` have been set up in ${channel}.`;
        break;
      }
      case "role": {
        const role = int.options.getRole("role");
        settings.reminders.events[type as EventsKeys].role = role?.id || null;
        resp = `Role to mention for \`${type}\` has been ${role ? "set to" + role : "disabled"}.`;
        break;
      }
      case "disable-all": {
        await utils.disableAll(settings, client);
        resp = `All events reminders have been disabled.`;
        break;
      }
      case "status": {
        resp = { embeds: [utils.getEventReminderStatus(settings, int.guild)] };
      }
    }

    await int.editReply(resp);
  },
} satisfies Command;
