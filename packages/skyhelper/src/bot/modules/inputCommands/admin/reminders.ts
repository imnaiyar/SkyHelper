import { REMINDERS_DATA } from "@/modules/commands-data/admin-commands";
import type { Command } from "@/structures";
import type { GuildSchema } from "@/types/schemas";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { PermissionsUtil } from "@/utils/classes/PermissionUtils";
import RemindersUtils from "@/utils/classes/RemindersUtils";
import { store } from "@/utils/customId-store";
import { getTSData } from "@/utils/getEventDatas";
import {
  MessageFlags,
  type APIGuildForumChannel,
  type APITextChannel,
  type APIContainerComponent,
  ComponentType,
} from "@discordjs/core";
import { REMINDERS_KEY, SendableChannels } from "@skyhelperbot/constants";
import { SkytimesUtils, type EventKey, container, textDisplay, row, separator, ShardsUtil } from "@skyhelperbot/utils";
import { DateTime } from "luxon";
const RemindersEventsMap: Record<string, string> = {
  eden: "Eden/Weekly Reset",
  geyser: "Geyser",
  grandma: "Grandma",
  turtle: "Turtle",
  dailies: "Daily Quests",
  ts: "Traveling Spirit",
  aurora: "Aurora's Concert",
  reset: "Daily Reset",
  "fireworks-festival": "Aviary Fireworks Festival",
  "shards-eruption": "Shards Eruption",
};
export default {
  async interactionRun({ helper, options }) {
    const { client, t } = helper;
    await helper.defer();

    const sub = options.getSubcommand(true);
    const guild = helper.client.guilds.get(helper.int.guild_id || "");
    if (!guild) throw new Error("Somehow recieved reminders command in non-guild context");
    const guildSettings = await client.schemas.getSettings(guild);
    const checkClientPerms = async (ch: APITextChannel | APIGuildForumChannel) => {
      const clientPerms = PermissionsUtil.overwriteFor(guild.clientMember, ch, client);
      if (!clientPerms.has("ManageWebhooks")) {
        await helper.editReply({
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
          return void (await helper.editReply({
            content: "Invalid channel type. Please provide a valid text channel or thread channel.",
          }));
        }
        if (!(await checkClientPerms(channel))) return;
        const util = new RemindersUtils(client);
        const event = options.getString("event", true) as (typeof REMINDERS_KEY)[number];

        let shard_type: ("red" | "black")[] = [];
        if (event === "shards-eruption") {
          const T = await awaitShardTypeResponse(helper, guildSettings);
          if (!T) return;
          shard_type = T;
        }
        const wb = await util.createWebhookAfterChecks(
          channel.id,
          {
            name: "SkyHelper Reminders",
            avatar: client.utils.getUserAvatar(client.user),
          },
          `For ${RemindersEventsMap[event]} Reminders`,
        );
        const role = options.getRole("role");
        guildSettings.reminders.events[event as Exclude<typeof event, "shards-eruption">] = {
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

        if (event === "shards-eruption") {
          guildSettings.reminders.events[event]!.shard_type = shard_type;
        }
        guildSettings.reminders.active = true;

        await guildSettings.save();
        const eventToGet = ["dailies", "reset"].includes(event) ? "daily-reset" : event;
        const nextOccurence = await getRemindersNextOccurence(eventToGet, offset, shard_type);
        await helper.editReply({
          components: [
            textDisplay(
              `Successfully configured \`${RemindersEventsMap[event]}\` reminders in <#${ch.id}>${role ? ` with role <@&${role.id}>` : ""}.`,
            ),
            separator(true, 1),
            textDisplay(
              `-# Next reminders for \`${RemindersEventsMap[event]}\` will be sent <t:${nextOccurence}:R>`,
              (offset ? `-# Offset: \`${offset}\` minutes\n` : "") +
                (shard_type.length ? `-# Shard Type: ${shard_type.join(", ")}` : ""),
            ),
          ],
          allowed_mentions: { parse: [] },
          flags: MessageFlags.IsComponentsV2,
        });
        break;
      }
      case "stop": {
        const event = options.getString("event", true);
        let eventSettings = guildSettings.reminders.events[event as keyof GuildSchema["reminders"]["events"]];
        if (!eventSettings?.active) {
          return void (await helper.editReply({
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
        eventSettings = null;

        const isAnyActive = RemindersUtils.checkActive(guildSettings);
        if (!isAnyActive) guildSettings.reminders.active = false;
        await guildSettings.save();
        await helper.editReply({
          content: `Successfully stopped ${RemindersEventsMap[event]} reminders`,
        });
        break;
      }
      case "status": {
        await helper.editReply(await getRemindersStatus(guildSettings, guild.name));
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
    if (!event?.active) {
      reminders.push(`${name}: Inactive`);
    } else {
      let toPush = `${name}\n  - Channel: <#${event.webhook!.threadId ?? event.webhook!.channelId}>`;
      if (event.role) toPush += `\n  - Role: <@&${event.role}>`;
      if (event.offset) toPush += `\n  - Offset: \`${event.offset}\` minutes.`;
      if ("shard_type" in event) toPush += `\n  - Shard Type: ${event.shard_type.join(", ")}`;
      reminders.push(toPush);
    }
  }
  description += "- " + reminders.join("\n- ");
  const component: APIContainerComponent = container(textDisplay(description));

  return { components: [container(textDisplay(title)), component], flags: MessageFlags.IsComponentsV2 };
}

/**
 * Collect an addition response for shards eruption to choose which type of shard they want reminders for
 * @param helper the interaction helper
 * @param settings the guild settings
 * @returns returns null or array of selected shard types
 */
async function awaitShardTypeResponse(helper: InteractionHelper, settings: GuildSchema) {
  const text = textDisplay("Please select the shard type for the eruption reminder:");
  const shard_type = settings.reminders.events["shards-eruption"]?.shard_type || [];
  const select = row({
    type: ComponentType.StringSelect,
    custom_id: store.serialize(19, { data: "shard_type_select", user: helper.user.id }),
    options: [
      {
        label: "Black Shards",
        value: "black",
        default: shard_type.includes("black"),
      },
      {
        label: "Red Shards",
        value: "red",
        default: shard_type.includes("red"),
      },
    ],
    placeholder: "Select shard type",
    min_values: 1,
    max_values: 2,
  });

  const message = await helper.editReply({ components: [text, separator(true, 1), select], flags: MessageFlags.IsComponentsV2 });

  const response = await helper.client
    .awaitComponent({
      filter: (i) => (i.member?.user || i.user!).id === helper.user.id,
      message,
      componentType: ComponentType.StringSelect,
      timeout: 6e4, // 1 min
    })
    .catch(() => {});

  if (!response) {
    await helper.editReply({ components: [textDisplay("Response timed out. I didn't recieve a response in time")] });
    return null;
  }

  await helper.client.api.interactions.deferMessageUpdate(response.id, response.token);

  return response.data.values as ("black" | "red")[];
}

async function getRemindersNextOccurence(
  event: (typeof REMINDERS_KEY)[number] | "daily-reset",
  offset: number,
  shardType: ("red" | "black")[] = [],
) {
  let nextOccurence: DateTime;
  if (event === "ts") {
    nextOccurence = (await getTSData())!.nextVisit;
  } else if (event === "shards-eruption") {
    const nextShard = ShardsUtil.getNextShardFromNow(shardType);
    nextOccurence = nextShard.start;
  } else {
    nextOccurence = SkytimesUtils.getNextEventOccurrence(event as EventKey);
  }
  return nextOccurence.minus({ minutes: offset }).toUnixInteger();
}
