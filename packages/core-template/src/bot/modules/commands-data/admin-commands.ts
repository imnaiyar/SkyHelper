import type { Command } from "@/structures/Command";
import { PermissionsUtil } from "@/utils/classes/PermissionUtils";
import {
  ApplicationCommandOptionType,
  ApplicationIntegrationType,
  ChannelType,
  InteractionContextType,
  type APITextChannel,
} from "@discordjs/core";
const eventChoices = [
  { name: "Geyser", value: "geyser" },
  { name: "Grandma", value: "grandma" },
  { name: "Turtle", value: "turtle" },
  { name: "Daily Reset", value: "reset" },
  { name: "Eden/Weekly Reset", value: "eden" },
  { name: "Traveling Spirit", value: "ts" },
  { name: "Daily Quests", value: "dailies" },
  { name: "Aurora's Concert", value: "aurora" },
];
// #region Reminders
export const REMINDERS_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "reminders",
  description: "Set up reminders",
  data: {
    name_localizations: "commands:REMINDERS.name",
    description_localizations: "commands:REMINDERS.description",
    options: [
      {
        name: "configure",
        description: "configure reminders",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "channel where reminders should be sent",
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText, ChannelType.PublicThread, ChannelType.GuildAnnouncement],
            required: true,
          },
          {
            name: "event",
            description: "event to remind",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: eventChoices,
          },
          {
            name: "role",
            description: "role to ping",
            type: ApplicationCommandOptionType.Role,
            required: false,
          },
        ],
      },
      {
        name: "stop",
        description: "configure reminders",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "event",
            description: "event to stop reminding",
            type: ApplicationCommandOptionType.String,
            choices: eventChoices,
            required: true,
          },
        ],
      },
      {
        name: "status",
        description: "reminders configurations for this server",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
    integration_types: [ApplicationIntegrationType.GuildInstall],
    contexts: [InteractionContextType.Guild],
  },
  botPermissions: ["ManageWebhooks"],
  userPermissions: ["ManageGuild"],
  category: "Admin",
};

// #region ShardsLive
export const SHARDS_LIVE_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "shards-live",
  description: "auto updating message with live shards details",
  data: {
    name_localizations: "commands:SHARDS_LIVE.name",
    description_localizations: "commands:SHARDS_LIVE.description",
    options: [
      {
        name: "start",
        name_localizations: "commands:SHARDS_LIVE.options.START.name",
        description: "start live shards",
        description_localizations: "commands:SHARDS_LIVE.options.START.description",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            name_localizations: "commands:SHARDS_LIVE.options.START.option.CHANNEL.name",
            description: "channel where shard details should be updated",
            description_localizations: "commands:SHARDS_LIVE.options.START.option.CHANNEL.description",
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "stop",
        name_localizations: "commands:SHARDS_LIVE.options.STOP.name",
        description: "stop live shard",
        description_localizations: "commands:SHARDS_LIVE.options.STOP.description",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
    integration_types: [0],
    contexts: [0],
  },
  prefix: {
    usage: "<sub> [#channel]",
    minimumArgs: 1,
    subcommands: [
      {
        trigger: "start <#channel>",
        description: "starts live-shards in the given channel",
      },
      {
        trigger: "stop",
        description: "stop live shards",
      },
    ],
  },
  validations: [
    {
      type: "interaction",
      callback: ({ interaction, options, t, helper }) => {
        const { client } = helper;
        if (!interaction.guild_id) return { status: false, message: "Command is only available fo guild" };
        const guild = client.guilds.get(interaction.guild_id);
        if (!guild) return { status: false, message: "Guild not found" };
        const ch = options.getChannel("channel");
        if (!ch) return { status: true };
        const channel = client.channels.get(ch.id) as APITextChannel;
        const sub = options.getSubcommand();
        if (sub !== "start") return { status: true };
        if (!PermissionsUtil.overwriteFor(guild.clientMember, channel, client).has("ManageWebhooks")) {
          return {
            status: false,
            message: t("common:NO-WB-PERM-BOT", { CHANNEL: `<#${channel.id}>` }),
          };
        }
        return { status: true };
      },
    },
  ],
  botPermissions: ["ManageWebhooks"],
  userPermissions: ["ManageGuild"],
  category: "Admin",
};

// #region TimesLive
export const TIMES_LIVE_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "skytimes-live",
  description: "auto updating message with live skytimes details",
  data: {
    name_localizations: "commands:SKYTIMES_LIVE.name",
    description_localizations: "commands:SKYTIMES_LIVE.description",
    options: [
      {
        name: "start",
        name_localizations: "commands:SKYTIMES_LIVE.options.START.name",
        description: "configure auto skytimes",
        description_localizations: "commands:SKYTIMES_LIVE.options.START.description",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            name_localizations: "commands:SKYTIMES_LIVE.options.START.option.CHANNEL.name",
            description: "channel where skytimes details should be updated",
            description_localizations: "commands:SKYTIMES_LIVE.options.START.option.CHANNEL.description",
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "stop",
        name_localizations: "commands:SKYTIMES_LIVE.options.STOP.name",
        description: "stop auto skytimes",
        description_localizations: "commands:SKYTIMES_LIVE.options.STOP.description",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
    integration_types: [0],
    contexts: [0],
  },
  prefix: {
    usage: "<sub> [#channel]",
    minimumArgs: 1,
    subcommands: [
      {
        trigger: "start <#channel>",
        description: "starts live-skytimes in the given channel",
      },
      {
        trigger: "stop",
        description: "stop live skytimes",
      },
    ],
  },
  validations: [
    {
      type: "interaction",
      callback: ({ interaction, options, t, helper: { client } }) => {
        if (!interaction.guild_id) return { status: false, message: "Command is only available fo guild" };

        const guild = client.guilds.get(interaction.guild_id);
        if (!guild) return { status: false, message: "Guild not found" };

        const ch = options.getChannel("channel");
        if (!ch) return { status: true };
        const channel = client.channels.get(ch.id) as APITextChannel;
        if (!PermissionsUtil.overwriteFor(guild.clientMember, channel, client).has("ManageWebhooks")) {
          return {
            status: false,
            message: t("common:NO-WB-PERM-BOT", { CHANNEL: `<#${channel.id}>` }),
          };
        }
        return { status: true };
      },
    },
  ],
  botPermissions: ["ManageWebhooks"],
  userPermissions: ["ManageGuild"],
  category: "Admin",
};