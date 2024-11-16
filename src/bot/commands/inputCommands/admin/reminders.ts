import { REMINDERS_DATA } from "#bot/commands/commands-data/admin-commands";
import type { EventsKeys } from "#bot/libs/types";
import type { Command, SkyHelper } from "#structures";
import { ChannelType, Routes, type GuildTextBasedChannel, type TextChannel, type Webhook } from "discord.js";

export default {
  ...REMINDERS_DATA,
  interactionRun: async (int, t, client) => {
    if (!int.inCachedGuild()) throw new Error("Somehow this command was ran outside of a guild");

    const sub = int.options.getSubcommand(true);
    if (sub === "setup") {
      const type = int.options.getString("type", true);
      const channel = int.options.getChannel("channel", true);
      if (channel.type !== ChannelType.GuildText) throw new Error("Channel must be a text channel");
      const role = int.options.getRole("role", false);
      const settings = await client.database.getSettings(int.guild);
      const wb = await checkBotsWb(channel, client);
      settings.reminders.events[type as EventsKeys] = {
        active: true,
        webhook: {
          id: wb.id,
          token: wb.token,
          channelId: wb.channelId,
        },
        role: role ? role.id : null,
      };
      settings.reminders.active = true;
    }
  },
} satisfies Command;

async function checkBotsWb(channel: TextChannel, client: SkyHelper): Promise<Webhook> {
  const wbs = await channel.fetchWebhooks();
  const botWb = wbs.find((wb) => wb.owner?.id === client.user?.id);
  if (!botWb) {
    return createWebhook(channel);
  }
  return botWb;
}

function createWebhook(channel: TextChannel, reason: string = "") {
  return channel.createWebhook({
    name: "SkyHelper Reminder",
    reason: reason ?? "For sending reminders",
    avatar: channel.client.user.displayAvatarURL(),
  });
}

function deleteWebhook(client: SkyHelper, wbId: string, wbToken: string, reason: string = "No longer needed") {
  return client.rest.delete(Routes.webhook(wbId, wbToken), { reason });
}
