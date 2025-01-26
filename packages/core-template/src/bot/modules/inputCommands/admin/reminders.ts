import { REMINDERS_DATA } from "@/modules/commands-data/admin-commands";
import type { Command } from "@/structures";
import type { GuildSchema } from "@/types/schemas";
import { PermissionsUtil } from "@/utils/classes/PermissionUtils";
import RemindersUtils from "@/utils/classes/RemindersUtils";
import type { APITextChannel } from "@discordjs/core";
const RemindersEventsMap: Record<string, string> = {
  eden: "Eden/Weekly Reset",
  geyser: "Geyser",
  grandma: "Grandma",
  turtle: "Turtle",
  dailies: "Daily Quests",
  ts: "Traveling Spirit",
  concert: "Aurora's Concert",
  reset: "Daily Reset",
};
export default {
  async interactionRun({ helper, options }) {
    const { client, t } = helper;
    const sub = options.getSubcommand(true);
    const guild = helper.client.guilds.get(helper.int.guild_id || "");
    if (!guild) throw new Error("Somehow recieved reminders command in non-guild context");
    const guildSettings = await client.schemas.getSettings(guild);
    const checkClientPerms = async (ch: APITextChannel) => {
      const clientPerms = PermissionsUtil.overwriteFor(guild.clientMember, ch, client);
      if (!clientPerms.has("ManageWebhooks")) {
        await helper.reply({
          content: t("common:NO-WB-PERM-BOT", { CHANNEL: `<#${ch.id}>` }),
        });
        return false;
      }
      return true;
    };
    switch (sub) {
      case "configure": {
        const ch = options.getChannel("channel", true);
        const channel = client.channels.get(ch.id)! as APITextChannel;
        if (!(await checkClientPerms(channel))) return;
        const util = new RemindersUtils(client);
        const event = options.getString("event", true);
        const wb = await util.createWebhookAfterChecks(
          channel.id,
          {
            name: "SkyHelper Reminders",
            avatar: client.utils.getUserAvatar(client.user),
          },
          `For ${RemindersEventsMap[event]} Reminders`,
        );
        const role = options.getRole("role");
        guildSettings.reminders.events[event as keyof GuildSchema["reminders"]["events"]] = {
          active: true,
          webhook: {
            channelId: wb.channel_id,
            id: wb.id,
            token: wb.token!,
          },
          role: role?.id ?? null,
        };
        await guildSettings.save();
        await helper.reply({
          content: `Successfully configured ${RemindersEventsMap[event]} reminders in <#${channel.id}>${role ? ` with role <@&${role.id}>` : ""}.`,
          allowed_mentions: { parse: [] },
        });
        break;
      }
      case "stop": {
        const event = options.getString("event", true);
        const eventSettings = guildSettings.reminders.events[event as keyof GuildSchema["reminders"]["events"]];
        if (!eventSettings.active) {
          return void (await helper.reply({
            content: `Reminders for ${RemindersEventsMap[event]} are already inactive`,
          }));
        }
        const util = new RemindersUtils(client);
        await util.deleteAfterChecks(
          {
            id: eventSettings.webhook!.id,
            token: eventSettings.webhook!.token!,
          },
          event,
          guildSettings,
        );
        eventSettings.active = false;
        eventSettings.webhook = null;
        eventSettings.role = null;
        await guildSettings.save();
        await helper.reply({
          content: `Successfully stopped ${RemindersEventsMap[event]} reminders`,
        });
        break;
      }
      case "status": {
        await helper.reply(await getRemindersStatus(guildSettings, guild.name));
        break;
      }
    }
  },
  ...REMINDERS_DATA,
} satisfies Command;

async function getRemindersStatus(guildSettings: GuildSchema, guildName: string) {
  const title = `Reminders Status for ${guildName}`;
  const description = `Status: ${RemindersUtils.checkActive(guildSettings) ? "Active" : "Inactive"}`;
  const fields = [];
  for (const [k, name] of Object.entries(RemindersEventsMap)) {
    const event = guildSettings.reminders.events[k as keyof GuildSchema["reminders"]["events"]];
    fields.push({
      name,
      value: `- Status: ${event?.active ? "Active" : "Inactive"}${event?.active ? `\n- Channel: <#${event.webhook?.channelId}>\n- Role: ${event.role ? `<@&${event.role}>` : "None"}` : ""}`,
      inline: true,
    });
  }
  // put zero width field to make it align
  fields.push({ name: "\u200b", value: "\u200b", inline: true });
  return { embeds: [{ title, description, fields }] };
}
