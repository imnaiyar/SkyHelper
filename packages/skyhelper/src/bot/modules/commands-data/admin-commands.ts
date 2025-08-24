import { defineStructure, type InteractionOptions, type Options, type ValidationReturn } from "@/structures/Command";
import type { Awaitable } from "@/types/utils";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { PermissionsUtil } from "@/utils/classes/PermissionUtils";
import {
  ApplicationCommandOptionType,
  ApplicationIntegrationType,
  ChannelType,
  InteractionContextType,
  type APIChatInputApplicationCommandInteraction,
  type APIGuildForumChannel,
  type APITextChannel,
} from "@discordjs/core";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
const eventChoices = [
  { name: "Geyser", value: "geyser" },
  { name: "Grandma", value: "grandma" },
  { name: "Turtle", value: "turtle" },
  { name: "Daily Reset", value: "reset" },
  { name: "Eden/Weekly Reset", value: "eden" },
  { name: "Traveling Spirit", value: "ts" },
  { name: "Shards Eruption", value: "shards-eruption" },
  { name: "Daily Quests", value: "dailies" },
  { name: "Aurora's Concert", value: "aurora" },
  { name: "Aviary Fireworks Festival", value: "fireworks-festival" },
];

const commonCallback = ({
  options,
  helper,
}: {
  helper: InteractionHelper;
  options: InteractionOptionResolver;
}): Awaitable<ValidationReturn> => {
  const { client, int } = helper;
  const commandName = (int as APIChatInputApplicationCommandInteraction).data.name;
  if (!["reminders", "live"].includes(commandName)) return { status: false, message: "Wrong Command" };

  if (!int.guild_id) return { status: false, message: "Command is only available fo guild" };
  const guild = client.guilds.get(int.guild_id);
  if (!guild) return { status: false, message: "Guild not found" };
  const ch = options.getChannel("channel");

  if (!ch) return { status: true };
  const isThread = "thread_metadata" in ch;

  const resolvedChannel = client.channels.get(isThread ? ch.parent_id! : ch.id)! as APITextChannel | APIGuildForumChannel;

  const sub = options.getSubcommand();
  if (sub !== "start" && sub !== "configure") return { status: true };

  if (!PermissionsUtil.overwriteFor(guild.clientMember, resolvedChannel, client).has("ManageWebhooks")) {
    return {
      status: false,
      message: helper.t("common:NO-WB-PERM-BOT", { CHANNEL: `<#${resolvedChannel.id}>` }),
    };
  }
  return { status: true };
};
// #region Reminders
export const REMINDERS_DATA = defineStructure({
  name: "reminders",
  description: "Set up reminders",
  data: {
    name_localizations: "commands:REMINDERS.name",
    description_localizations: "commands:REMINDERS.description",
    options: [
      {
        name: "configure",
        name_localizations: "commands:REMINDERS.options.CONFIGURE.name",
        description: "configure reminders",
        description_localizations: "commands:REMINDERS.options.CONFIGURE.description",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            name_localizations: "commands:LIVE_UPDATES.options.START.option.CHANNEL.name",
            description: "channel where reminders should be sent",
            description_localizations: "commands:REMINDERS.options.CONFIGURE.options.CHANNEL.description",
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText, ChannelType.PublicThread],
            required: true,
          },
          {
            name: "event",
            name_localizations: "commands:REMINDERS.options.CONFIGURE.options.EVENT.name",
            description_localizations: "commands:REMINDERS.options.CONFIGURE.options.EVENT.description",
            description: "event to remind",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: eventChoices,
          },
          {
            name: "role",
            name_localizations: "commands:REMINDERS.options.CONFIGURE.options.ROLE.name",
            description_localizations: "commands:REMINDERS.options.CONFIGURE.options.ROLE.description",
            description: "role to ping",
            type: ApplicationCommandOptionType.Role,
            required: false,
          },
          {
            name: "offset",
            name_localizations: "commands:REMINDERS.options.CONFIGURE.options.OFFSET.name",
            description_localizations: "commands:REMINDERS.options.CONFIGURE.options.OFFSET.description",
            description: "how many minutes before the event should the reminder be sent.",
            type: ApplicationCommandOptionType.Integer,
            max_value: 15,
            min_value: 1,
            required: false,
          },
        ],
      },
      {
        name: "stop",
        name_localizations: "commands:REMINDERS.options.STOP.name",
        description_localizations: "commands:REMINDERS.options.STOP.description",
        description: "configure reminders",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "event",
            name_localizations: "commands:REMINDERS.options.CONFIGURE.options.EVENT.name",
            description_localizations: "commands:REMINDERS.options.STOP.options.EVENT.description",
            description: "event to stop reminding",
            type: ApplicationCommandOptionType.String,
            choices: eventChoices,
            required: true,
          },
        ],
      },
      {
        name: "status",
        name_localizations: "commands:REMINDERS.options.STATUS.name",
        description_localizations: "commands:REMINDERS.options.STATUS.description",
        description: "reminders configurations for this server",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ] as const,
    integration_types: [ApplicationIntegrationType.GuildInstall],
    contexts: [InteractionContextType.Guild],
  },
  userPermissions: ["ManageGuild"],
  validations: [
    {
      type: "interaction",
      callback: ({ helper, optionsResolver }) => commonCallback({ helper, options: optionsResolver }),
    },
  ],
  category: "Admin",
});

// #region Liveupdates
export const LIVE_UPDATES_DATA = defineStructure({
  name: "live",
  description: "live shards or skytimes update with auto updating message at regular interval",
  data: {
    name_localizations: "commands:LIVE_UPDATES.name",
    description_localizations: "commands:LIVE_UPDATES.description",
    options: [
      {
        name: "updates",
        name_localizations: "commands:LIVE_UPDATES.group",
        description_localizations: "commands:LIVE_UPDATES.group-desc",
        description: "live updates",
        type: ApplicationCommandOptionType.SubcommandGroup,
        options: [
          {
            name: "start",
            name_localizations: "commands:LIVE_UPDATES.options.START.name",
            description: "start live shards or skytimes update with auto updating message at regular interval",
            description_localizations: "commands:LIVE_UPDATES.options.START.description",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "channel",
                name_localizations: "commands:LIVE_UPDATES.options.START.option.CHANNEL.name",
                description: "channel where shard details should be updated",
                description_localizations: "commands:LIVE_UPDATES.options.START.option.CHANNEL.description",
                type: ApplicationCommandOptionType.Channel,
                channel_types: [ChannelType.GuildText, ChannelType.PublicThread],
                required: true,
              },
              {
                name: "type",
                description: "type of live updates",
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                  { name: "Shards", value: "shards" },
                  { name: "Skytimes", value: "skytimes" },
                ],
              },
            ],
          },
          {
            name: "stop",
            name_localizations: "commands:LIVE_UPDATES.options.STOP.name",
            description: "stop live shard",
            description_localizations: "commands:LIVE_UPDATES.options.STOP.description",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "type",
                description: "type of live updates",
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                  { name: "Shards", value: "shards" },
                  { name: "Skytimes", value: "skytimes" },
                ],
              },
            ],
          },
        ],
      },
    ] as const,
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
      callback: ({ helper, optionsResolver }) => commonCallback({ helper, options: optionsResolver }),
    },
  ],
  userPermissions: ["ManageGuild"],
  category: "Admin",
});
