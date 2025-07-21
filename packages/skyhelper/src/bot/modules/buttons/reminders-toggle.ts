import { defineButton } from "@/structures";
import { handleRemindersStatus } from "@/utils/classes/Embeds";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { PermissionsUtil } from "@/utils/classes/PermissionUtils";
import RemindersUtils from "@/utils/classes/RemindersUtils";
import { CustomId } from "@/utils/customId-store";
import { RemindersEventsMap, type REMINDERS_KEY } from "@skyhelperbot/constants";
import { container, row, section, separator, textDisplay } from "@skyhelperbot/utils";
import {
  ChannelType,
  ComponentType,
  MessageFlags,
  SelectMenuDefaultValueType,
  type APIGuildForumChannel,
  type APITextChannel,
} from "discord-api-types/v10";

export default defineButton({
  data: { name: "reminders-manage" },
  id: CustomId.RemindersManage,
  async execute(interaction, _t, helper, { key: event_key, page }) {
    const key = event_key as (typeof REMINDERS_KEY)[number];
    const { client } = helper;
    const { store } = client.utils;
    await helper.deferUpdate();
    const guild = client.guilds.get(interaction.guild!.id);
    if (!guild) throw new Error("'guild not found");
    const settings = await client.schemas.getSettings(guild);
    const events = settings.reminders.events;

    const comp = () => {
      const event = events[key];
      const channel = event?.webhook?.threadId || event?.webhook?.channelId;
      const texts = [
        "### Status: " + (event?.active ? "Active" : "Inactive"),
        `- Channel: ` + (channel ? `<#${channel}>` : "None"),
        "- Role: " + (event?.role ? `<@&${event.role}>` : "None"),
        `- Offset: \`${event?.offset || 0}\` minutes.`,
        event && "shard_type" in event ? `- Shard Type: ${event.shard_type.join(", ")}` : "",
      ] as const;
      return container(
        section(
          {
            type: 2,
            custom_id: store.serialize(CustomId.Default, { data: "reminder_manage_back", user: helper.user.id }),
            style: 4,
            label: "Back",
          },
          "-# Reminders Settings: " + guild.name,
          `**${RemindersEventsMap[key]}**`,
        ),
        separator(true, 1),
        event?.active
          ? section(
              {
                type: 2,
                custom_id: store.serialize(19, { data: "reminder_manage_disable", user: helper.user.id }),
                style: 4,
                label: "Disable",
              },
              texts.join("\n"),
            )
          : textDisplay(...texts),
        separator(),
        row({
          type: ComponentType.ChannelSelect,
          custom_id: store.serialize(19, { data: "reminder_manage_channel", user: helper.user.id }),
          placeholder: "Manage this reminder's channel.",
          max_values: 1,
          channel_types: [ChannelType.GuildText, ChannelType.PublicThread],
          default_values: channel ? [{ id: channel, type: SelectMenuDefaultValueType.Channel }] : undefined,
        }),
        row({
          type: ComponentType.RoleSelect,
          custom_id: store.serialize(19, { data: "reminder_manage_role", user: helper.user.id }),
          placeholder: "Manage this reminder's role.",
          max_values: 4,
          min_values: 0,
          default_values: event?.role?.length
            ? event.role.map((r) => ({ id: r, type: SelectMenuDefaultValueType.Role }))
            : undefined,
        }),
        row({
          type: ComponentType.StringSelect,
          custom_id: store.serialize(19, { data: "reminder_manage_offset", user: helper.user.id }),
          placeholder: "Manage this reminder's offset.",
          max_values: 1,
          min_values: 0,
          options: Array.from({ length: 16 }, (_, i) => i).map((num) => ({
            label: `${num} minute${num < 2 ? "" : "s"}`,
            value: `${num}`,
            default: event?.offset ? event.offset === num : undefined,
          })),
        }),

        ...(event && "shard_type" in event
          ? [
              row({
                type: ComponentType.StringSelect,
                custom_id: store.serialize(19, { data: "reminder_manage_shardType", user: helper.user.id }),
                placeholder: "Manage this reminder's shard type.",
                max_values: 2,
                min_values: 1,
                options: ["red", "black"].map((type) => ({
                  label: type === "red" ? "Red Shards" : "Black Shards",
                  value: type,
                  default: event.shard_type.includes(type as "black" | "red"),
                })),
              }),
            ]
          : []),
      );
    };

    const checkClientPerms = (ch: APITextChannel | APIGuildForumChannel) => {
      const clientPerms = PermissionsUtil.overwriteFor(guild.clientMember, ch, client);
      if (!clientPerms.has("ManageWebhooks")) return false;

      return true;
    };

    const message = await helper.editReply({ components: [comp()], flags: MessageFlags.IsComponentsV2 });

    const collector = client.componentCollector({
      filter: (i) => (i.member?.user || i.user!).id === helper.user.id,
      idle: 6e4,
      message,
    });

    collector.on("collect", async (i) => {
      const { id, data } = store.deserialize(i.data.custom_id);
      if (id !== 19) throw Error("boop");

      const compHelper = new InteractionHelper(i, client);
      await compHelper.deferUpdate();

      const event = events[key];

      const rem_helper = new RemindersUtils(client);
      const [_a, _s, type] = data.data!.split("_");
      if (compHelper.isButton(i)) {
        if (type === "back") {
          collector.stop();
          return; // back reminder status is handled in end event
        }

        // can only be disable button the
        if (event?.webhook) await rem_helper.deleteAfterChecks(event.webhook, [key], settings);
        events[key] = null;
        if (!rem_helper.checkAnyActive(settings)) settings.reminders.active = false;
      }

      if (compHelper.isChannelSelect(i)) {
        const ch = Object.values(i.data.resolved.channels)[0];
        const isThread = "thread_metadata" in ch;
        const channel = client.channels.get(isThread ? ch.parent_id! : ch.id)! as APITextChannel | APIGuildForumChannel;

        if (!checkClientPerms(channel)) {
          await compHelper.editReply({});

          await compHelper.followUp({
            content: _t("common:NO-WB-PERM-BOT", { CHANNEL: `<#${ch.id}>` }),
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        const webhook = await rem_helper.createWebhookAfterChecks(
          channel.id,
          {
            name: "SkyHelper Reminders",
            avatar: client.utils.getUserAvatar(client.user),
          },
          "For Reminders",
        );
        // delete prev webhook if diff channel
        if (event?.webhook?.channelId && event.webhook.channelId !== channel.id) {
          await rem_helper.deleteAfterChecks(event.webhook, [key], settings);
        }
        events[key] = {
          last_messageId: event?.last_messageId || null,
          role: event?.role || null,
          shard_type: event && "shard_type" in event ? event?.shard_type : ["black", "red"],
          ...events[key],
          active: true,
          webhook: {
            id: webhook.id,
            token: webhook.token!,
            channelId: webhook.channel_id,
            threadId: isThread ? ch.id : undefined,
          },
        };
      }

      if (compHelper.isRoleSelect(i)) {
        events[key] = {
          active: event?.active || false,
          last_messageId: event?.last_messageId || null,
          shard_type: event && "shard_type" in event ? event?.shard_type : ["black", "red"],
          webhook: event?.webhook || undefined,
          ...events[key],
          role: i.data.values.length ? i.data.values : null,
        };
      }

      if (compHelper.isStringSelect(i)) {
        if (type === "offset") {
          events[key] = {
            active: event?.active || false,
            last_messageId: event?.last_messageId || null,
            shard_type: event && "shard_type" in event ? event?.shard_type : ["black", "red"],
            webhook: event?.webhook || undefined,
            role: event?.role || null,
            ...events[key],
            offset: parseInt(i.data.values[0] || "0"),
          };
        } else {
          events[key] = {
            active: event?.active || false,
            last_messageId: event?.last_messageId || null,
            webhook: event?.webhook || undefined,
            role: event?.role || null,
            ...events[key],
            shard_type: i.data.values as Array<"red" | "black">,
          };
        }
      }
      await settings.save();
      await compHelper.editReply({ components: [comp()] });
    });

    collector.on("end", async (_, r) => {
      if (r === "manual") return;
      await handleRemindersStatus(helper, settings, guild.name, page);
    });
  },
});
