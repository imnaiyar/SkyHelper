import { REMINDERS_DATA } from "@/modules/commands-data/admin-commands";
import type { Command } from "@/structures";
import type { GuildSchema } from "@/types/schemas";
import { handleRemindersStatus } from "@/utils/classes/Embeds";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { PermissionsUtil } from "@/utils/classes/PermissionUtils";
import RemindersUtils from "@/utils/classes/RemindersUtils";
import { store } from "@/utils/customId-store";
import { MessageFlags, type APIGuildForumChannel, type APITextChannel, ComponentType } from "@discordjs/core";
import { REMINDERS_KEY, SendableChannels, RemindersEventsMap } from "@skyhelperbot/constants";
import { SkytimesUtils, type EventKey, textDisplay, row, separator, ShardsUtil, section, getNextTs } from "@skyhelperbot/utils";
import { DateTime } from "luxon";

export default {
  async interactionRun({ helper, options }) {
    const { client, t } = helper;
    await helper.defer();

    const sub = options.getSubcommand(true);
    const guild = helper.client.guilds.get(helper.int.guild_id ?? "");
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
        const offset = options.getInteger("offset") ?? 0;

        // Check if channel is a valid channel type (will never happen)
        if (!SendableChannels.includes(ch.type)) {
          return void (await helper.editReply({
            content: "Invalid channel type. Please provide a valid text channel or thread channel.",
          }));
        }
        if (!(await checkClientPerms(channel))) return;
        const util = new RemindersUtils(client);
        const event = options.getString("event", true) as (typeof REMINDERS_KEY)[number];

        let shard_type: Array<"red" | "black"> = [];
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
        const nextOccurence = getRemindersNextOccurence(eventToGet, offset, shard_type);
        await helper.editReply({
          components: [
            textDisplay(
              t(role ? "commands:REMINDERS.RESPONSES.CONFIGURED_ROLE" : "commands:REMINDERS.RESPONSES.CONFIGURED", {
                EVENT: RemindersEventsMap[event],
                CHANNEL: `<#${ch.id}>`,
                ROLE: role ? `<@&${role.id}>` : "",
              }),
            ),
            separator(true, 1),
            textDisplay(
              `-# ${t("commands:REMINDERS.RESPONSES.NEXT_TIME", {
                EVENT: RemindersEventsMap[event],
                TIME: `<t:${nextOccurence}:R>`,
              })}`,
              (offset ? "-# " + t("commands:REMINDERS.RESPONSES.OFFSET", { OFFSET: offset }) + "\n" : "") +
                (shard_type.length
                  ? "-# " + t("commands:REMINDERS.RESPONSES.SHARD_TYPE", { SHARD_TYPE: shard_type.join(", ") })
                  : ""),
            ),
          ],
          allowed_mentions: { parse: [] },
          flags: MessageFlags.IsComponentsV2,
        });
        break;
      }
      case "stop": {
        const event = options.getString("event", true) as (typeof REMINDERS_KEY)[number];
        const eventSettings = guildSettings.reminders.events[event];
        if (!eventSettings?.active) {
          return void (await helper.editReply({
            content: t("commands:REMINDERS.RESPONSES.ALREADY_NOT_CONFIGURED", {
              EVENT: RemindersEventsMap[event],
            }),
          }));
        }
        const util = new RemindersUtils(client);
        await util.deleteAfterChecks(
          {
            id: eventSettings.webhook!.id,
            token: eventSettings.webhook!.token,
          },
          [event],
          guildSettings,
        );
        guildSettings.reminders.events[event] = null;

        const isAnyActive = RemindersUtils.checkActive(guildSettings);
        if (!isAnyActive) guildSettings.reminders.active = false;
        await guildSettings.save();
        await helper.editReply({
          content: `Successfully stopped ${RemindersEventsMap[event]} reminders`,
        });
        break;
      }
      case "status": {
        await handleRemindersStatus(helper, guildSettings, guild.name);
        break;
      }
    }
  },
  ...REMINDERS_DATA,
} satisfies Command;

/**
 * Collect an addition response for shards eruption to choose which type of shard they want reminders for
 * @param helper the interaction helper
 * @param settings the guild settings
 * @returns returns null or array of selected shard types
 */
async function awaitShardTypeResponse(helper: InteractionHelper, settings: GuildSchema) {
  const shard_type = settings.reminders.events["shards-eruption"]?.shard_type ?? [];
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

  const message = await helper.editReply({
    components: [
      section(
        {
          type: 2,
          custom_id: store.serialize(19, { data: "shard_type_skip", user: helper.user.id }),
          label: "Skip!",
          style: 4,
        },
        "Please select the shard type for the eruption reminder:",
        "-# Note: Skipping this step when none of the options are selected will make it include both shard type",
      ),
      separator(true, 1),
      select,
    ],
    flags: MessageFlags.IsComponentsV2,
  });

  const response = await helper.client
    .awaitComponent({
      filter: (i) => (i.member?.user ?? i.user!).id === helper.user.id,
      message,
      timeout: 6e4, // 1 min
    })
    .catch(() => {});

  if (!response) {
    await helper.editReply({ components: [textDisplay("Response timed out. I didn't recieve a response in time")] });
    return null;
  }

  await helper.client.api.interactions.deferMessageUpdate(response.id, response.token);

  if (response.data.component_type === ComponentType.Button) {
    return shard_type.length ? shard_type : (["black", "red"] as Array<"black" | "red">);
  }
  return response.data.values as Array<"black" | "red">;
}

function getRemindersNextOccurence(
  event: (typeof REMINDERS_KEY)[number] | "daily-reset",
  offset: number,
  shardType: Array<"red" | "black"> = [],
) {
  let nextOccurence: DateTime;
  if (event === "ts") {
    nextOccurence = getNextTs()!.nextVisit;
  } else if (event === "shards-eruption") {
    const nextShard = ShardsUtil.getNextShardFromNow(shardType);
    nextOccurence = nextShard.start;
  } else {
    nextOccurence = SkytimesUtils.getNextEventOccurrence(event as EventKey);
  }
  return nextOccurence.minus({ minutes: offset }).toUnixInteger();
}
