import { defineButton } from "@/structures";
import { handleRemindersStatus } from "@/utils/classes/Embeds";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { PermissionsUtil } from "@/utils/classes/PermissionUtils";
import RemindersUtils from "@/utils/classes/RemindersUtils";
import { CustomId } from "@/utils/customId-store";
import { RemindersEventsMap, type REMINDERS_KEY } from "@skyhelperbot/constants";
import {
  ComponentType,
  MessageFlags,
  SelectMenuDefaultValueType,
  type APIGuildForumChannel,
  type APIModalInteractionResponseCallbackData,
  type APITextChannel,
} from "discord-api-types/v10";

export default defineButton({
  data: { name: "reminders-manage" },
  id: CustomId.RemindersManage,
  async execute(interaction, _t, helper, { key: event_key, page }) {
    const key = event_key as (typeof REMINDERS_KEY)[number];
    const { client } = helper;
    const { getModalComponent: getMC } = client.utils;
    const guild = client.guilds.get(interaction.guild!.id);
    if (!guild) throw new Error("'guild not found");
    const settings = await client.schemas.getSettings(guild);
    const events = settings.reminders.events;
    const event = events[key];

    const channel = event?.webhook?.threadId || event?.webhook?.channelId;
    const modal: APIModalInteractionResponseCallbackData = {
      title: `Editing ${RemindersEventsMap[key]} Reminder`,
      custom_id: `reminders_manage_modal;event:${key};extra:` + helper.int.id,
      components: [
        {
          type: ComponentType.Label,
          label: "Channel",
          description: "The channel where reminder should be sent. (Unselect to disable)",
          component: {
            type: ComponentType.ChannelSelect,
            custom_id: "channel",
            placeholder: "Select channel",
            max_values: 1,
            default_values: channel ? [{ id: channel, type: SelectMenuDefaultValueType.Channel }] : undefined,
            required: false,
          },
        },
        {
          type: ComponentType.Label,
          label: "Role",
          description: "The role to ping when sending this reminder.",
          component: {
            type: ComponentType.RoleSelect,
            custom_id: "role",
            placeholder: "Select role",
            max_values: 1,
            default_values: event?.role ? [{ id: event.role, type: SelectMenuDefaultValueType.Role }] : undefined,
            required: false,
          },
        },
        {
          type: ComponentType.Label,
          label: "Offset",
          description: "How many minutes before the event to send the reminder. (0-15 | Max upto 15 minutes)",
          component: {
            type: ComponentType.StringSelect,
            custom_id: "offset",
            placeholder: "Choose an offset",
            max_values: 1,
            options: Array.from({ length: 16 }, (_, i) => i).map((num) => ({
              label: `${num} minute${num < 2 ? "" : "s"}`,
              value: `${num}`,
              default: event?.offset ? event.offset === num : undefined,
            })),
            required: false,
          },
        },
      ],
    };

    if (key === "shards-eruption") {
      modal.components.push({
        type: ComponentType.Label,
        label: "Shard Type",
        description: "The type of shards you want to receive reminders for. (If none selected, both types will be used)",
        component: {
          type: ComponentType.StringSelect,
          custom_id: "shard_type",
          options: [
            {
              label: "Black Shards",
              value: "black",
              description: "Receive reminders for Black Shard eruptions",
              default: event?.shard_type?.includes("black"),
            },
            {
              label: "Red Shards",
              value: "red",
              description: "Receive reminders for Red Shard eruptions",
              default: event?.shard_type?.includes("red"),
            },
          ],
          placeholder: "Select shard types",
          min_values: 0,
          max_values: 2,
          required: false,
        },
      });
    }
    const checkClientPerms = (ch: APITextChannel | APIGuildForumChannel) => {
      const clientPerms = PermissionsUtil.overwriteFor(guild.clientMember, ch, client);
      if (!clientPerms.has("ManageWebhooks")) return false;

      return true;
    };
    await helper.launchModal(modal);

    const submit = await client
      .awaitModal({
        filter: (i) => i.data.custom_id === modal.custom_id,
        timeout: 2 * 6e4,
      })
      .catch(() => null);
    if (!submit) {
      helper.followUp({
        content: "You did not respond in time. Please try again.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const modalHelper = new InteractionHelper(submit, client);
    await modalHelper.deferUpdate();

    const s_channel = getMC(submit, "channel", ComponentType.ChannelSelect);
    const s_role = getMC(submit, "role", ComponentType.RoleSelect);
    const s_offset = getMC(submit, "offset", ComponentType.StringSelect);
    const s_shard_type = key === "shards-eruption" ? getMC(submit, "shard_type", ComponentType.StringSelect) : null;

    const rem_helper = new RemindersUtils(client);

    // if no channel selected, delete webhook and disable
    if (!s_channel.values.length) {
      if (event?.webhook) await rem_helper.deleteAfterChecks(event.webhook, [key], settings);
      events[key] = null;
      if (!rem_helper.checkAnyActive(settings)) settings.reminders.active = false;
      await settings.save();
      await handleRemindersStatus(modalHelper, settings, guild.name, page);
      await modalHelper.followUp({
        content: !s_channel.values.length
          ? `No channel selected! Reminders for ${RemindersEventsMap[key]} have been disabled.`
          : `Successfully updated ${RemindersEventsMap[key]} reminders!`,
        flags: 64,
      });
      return;
    }
    const ch = submit.data.resolved?.channels![s_channel.values[0]]!;
    const isThread = "thread_metadata" in ch;
    const new_channel = client.channels.get(isThread ? ch.parent_id! : ch.id)! as APITextChannel | APIGuildForumChannel;

    if (!checkClientPerms(new_channel)) {
      await handleRemindersStatus(modalHelper, settings, guild.name, page);

      await modalHelper.followUp({
        content: _t("common:NO-WB-PERM-BOT", { CHANNEL: `<#${ch.id}>` }),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const webhook = await rem_helper.createWebhookAfterChecks(
      new_channel.id,
      {
        name: "SkyHelper Reminders",
        avatar: client.utils.getUserAvatar(client.user),
      },
      "For Reminders",
    );
    // delete prev webhook if diff channel
    if (event?.webhook?.channelId && event.webhook.channelId !== new_channel.id) {
      await rem_helper.deleteAfterChecks(event.webhook, [key], settings);
    }

    events[key] = {
      ...events[key]!,
      role: s_role.values[0] ?? null,
      offset: s_offset.values[0] ? parseInt(s_offset.values[0]) : 0,
      shard_type: s_shard_type
        ? s_shard_type.values.length
          ? (s_shard_type.values as ("red" | "black")[])
          : ["red", "black"]
        : undefined,
      active: true,
      webhook: {
        id: webhook.id,
        token: webhook.token!,
        channelId: webhook.channel_id,
        threadId: isThread ? ch.id : undefined,
      },
    };

    await settings.save();
    await handleRemindersStatus(modalHelper, settings, guild.name, page);

    await modalHelper.followUp({
      content: `Successfully updated ${RemindersEventsMap[key]} reminders!`,
      flags: 64,
    });
  },
});
