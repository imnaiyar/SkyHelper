import { REMINDERS_DATA } from "@/modules/commands-data/admin-commands";
import type { Command } from "@/structures";
import type { GuildSchema } from "@/types/schemas";
import { PermissionsUtil } from "@/utils/classes/PermissionUtils";
import RemindersUtils from "@/utils/classes/RemindersUtils";
import { getTSData } from "@/utils/getEventDatas";
import { MessageFlags, type APIGuildForumChannel, type APITextChannel } from "@discordjs/core";
import { OverwrittenMimeTypes } from "@discordjs/rest";
import { SendableChannels } from "@skyhelperbot/constants";
import { SkytimesUtils, type EventKey } from "@skyhelperbot/utils";
import { FixedOffsetZone } from "luxon";
const RemindersEventsMap: Record<string, string> = {
  eden: "Eden/Weekly Reset",
  geyser: "Geyser",
  grandma: "Grandma",
  turtle: "Turtle",
  dailies: "Daily Quests",
  ts: "Traveling Spirit",
  aurora: "Aurora's Concert",
  reset: "Daily Reset",
};
export default {
  async interactionRun({ helper, options }) {
    const { client, t } = helper;
    const sub = options.getSubcommand(true);
    const guild = helper.client.guilds.get(helper.int.guild_id || "");
    if (!guild) throw new Error("Somehow recieved reminders command in non-guild context");
    const guildSettings = await client.schemas.getSettings(guild);
    const checkClientPerms = async (ch: APITextChannel | APIGuildForumChannel) => {
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
        const isThread = "thread_metadata" in ch;
        const channel = client.channels.get(isThread ? ch.parent_id! : ch.id)! as APITextChannel | APIGuildForumChannel;
        const offset = options.getInteger("offset") || 0;

        // Check if channel is a valid channel type
        if (!SendableChannels.includes(ch.type)) {
          return void (await helper.reply({
            content: "Invalid channel type. Please provide a valid text channel or thread channel.",
            flags: MessageFlags.Ephemeral,
          }));
        }
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
            threadId: isThread ? ch.id : undefined,
          },
          last_messageId: null,
          offset,
          role: role?.id ?? null,
        };
        guildSettings.reminders.active = true;

        await guildSettings.save();
        const eventToGet = ["dailies", "reset"].includes(event) ? "daily-reset" : event;
        let nextOccurence;
        if (eventToGet === "ts") {
          nextOccurence = (await getTSData())!.nextVisit;
        } else {
          nextOccurence = SkytimesUtils.getNextEventOccurrence(eventToGet as EventKey);
        }
        await helper.reply({
          content: `Successfully configured \`${RemindersEventsMap[event]}\` reminders in <#${ch.id}>${role ? ` with role <@&${role.id}>` : ""}.\n- -# Next reminders for \`${RemindersEventsMap[event]}\` will be sent <t:${nextOccurence.toUnixInteger()}:R>${offset > 0 ? " " + offset + " minutes earlier." : ""}`,
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
          [event],
          guildSettings,
        );
        eventSettings.active = false;
        eventSettings.webhook = null;
        eventSettings.role = null;
        eventSettings.offset = null;

        const isAnyActive = RemindersUtils.checkActive(guildSettings);
        if (!isAnyActive) guildSettings.reminders.active = false;
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
  let description = `### Status: ${RemindersUtils.checkActive(guildSettings) ? "Active" : "Inactive"}\n`;

  const reminders: Array<string> = [];
  for (const [k, name] of Object.entries(RemindersEventsMap)) {
    const event = guildSettings.reminders.events[k as keyof GuildSchema["reminders"]["events"]];
    if (!event.active) {
      reminders.push(`${name}: Inactive`);
    } else {
      let toPush = `${name}\n  - Channel: <#${event.webhook!.threadId ?? event.webhook!.channelId}>`;
      if (event.role) toPush += `\n  - Role: <@&${event.role}>`;
      if (event.offset) toPush += `\n  - Offset: \`${event.offset}\` minutes.`;
      reminders.push(toPush);
    }
  }
  description += "- " + reminders.join("\n- ");
  return { embeds: [{ title, description }] };
}
