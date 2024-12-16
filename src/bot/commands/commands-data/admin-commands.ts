import type { Command } from "#bot/structures/Command";
import { ApplicationCommandOptionType, ApplicationIntegrationType, ChannelType, InteractionContextType } from "discord.js";

// #region Reminders
export const REMINDERS_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "reminders",
  description: "Set up reminders",
  slash: {
    name_localizations: "commands:REMINDERS.name",
    description_localizations: "commands:REMINDERS.description",
    integration_types: [ApplicationIntegrationType.GuildInstall],
    contexts: [InteractionContextType.Guild],
  },
  botPermissions: ["ManageWebhooks"],
  userPermissions: ["ManageGuild"],
  category: "Admin",
};

// #region SetPrefix
export const SET_PREFIX_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "setprefix",
  description: "set the prefix for this server",
  prefix: {
    aliases: ["sp"],
    minimumArgs: 1,
    usage: "<prefix>",
    guildOnly: true,
  },
  userPermissions: ["ManageGuild"],
  category: "Admin",
};

// #region ShardsLive
export const SHARDS_LIVE_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "shards-live",
  description: "auto updating message with live shards details",
  slash: {
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
  botPermissions: ["ManageWebhooks"],
  userPermissions: ["ManageGuild"],
  category: "Admin",
};

// #region TimesLive
export const TIMES_LIVE_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "skytimes-live",
  description: "auto updating message with live skytimes details",
  slash: {
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
  botPermissions: ["ManageWebhooks"],
  userPermissions: ["ManageGuild"],
  category: "Admin",
};
