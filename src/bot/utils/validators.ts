import logger from "#bot/handlers/logger";
import type { Flags } from "#bot/libs/index";
import type { Command } from "#bot/structures/Command";
import type { ContextMenuCommand } from "#bot/structures/ContextMenuCommands";
import type {
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  Message,
  MessageCreateOptions,
  OmitPartialGroupDMChannel,
  PermissionFlags,
} from "discord.js";
import { Collection, PermissionFlagsBits, resolveColor } from "discord.js";
import { parsePerms, type Permission } from "skyhelper-utils";

export function validateEnv() {
  if (!process.env.TOKEN) throw new Error("TOKEN is not provided in the environment variables");
  if (!process.env.MONGO_CONNECTION) throw new Error("MONGO_CONNECTION is not provided in the environment variables");
  if (!process.env.SENTRY_DSN) throw new Error("SENTRY_DSN is not provided in the environment variables");
  if (!process.env.PUBLIC_KEY) throw new Error("PUBLIC_KEY is not provided in the environment variables");
  if (!process.env.CONTACT_US) logger.warn("CONTACT_US Webhook is not provided, command '/contact-us' will not work properly");
  for (const key of ["TOPGG_TOKEN", "DBL_TOKEN"]) {
    // prettier-ignore
    if (!process.env[key]) logger.warn(`${key} is not provided in the environment variables, the bot will not be able to post stats`);
  }
}

/**
 * Validates interactions if it passes a set of checks
 *
 * @param command The command to validate
 * @param interaction The interaction invoking the command
 * @param t Translator
 * @returns An object with status and message
 */
export function validateInteractions(
  command: Command | ContextMenuCommand<"MessageContext" | "UserContext">,
  interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction,
  t: ReturnType<typeof import("../i18n.js").getTranslator>,
) {
  const client = interaction.client;
  // Handle owner commands
  if (command.ownerOnly && !client.config.OWNER.includes(interaction.user.id)) {
    return {
      status: false,
      message: "This command is for owner(s) only.",
    };
  }
  // Handle command user required permissions
  if (command.userPermissions) {
    if (interaction.inGuild()) {
      if (interaction.inCachedGuild() && !interaction.member.permissions.has(command.userPermissions)) {
        return {
          status: false,
          message: t("errors:NO_PERMS_USER", {
            PERMISSIONS: parsePerms(command.userPermissions as Permission[]),
          }),
        };
      }
      if (!interaction.inCachedGuild()) {
        return {
          status: false,
          message: t("errors:NOT_A_SERVER"),
        };
      }
    }
  }

  // Handle bot's required permissions
  if (interaction.inGuild() && command.botPermissions) {
    let toCheck = true;
    if ("description" in command && command.forSubs && interaction.isChatInputCommand()) {
      const sub = interaction.options.getSubcommand();
      toCheck = command.forSubs.includes(sub);
    }
    if (toCheck) {
      if (!interaction.inCachedGuild()) {
        return {
          status: false,
          message: t("errors:NOT_A_SERVER"),
        };
      }

      const botPerms = interaction.guild.members.me!.permissions;

      if (toCheck && !botPerms.has(command.botPermissions)) {
        const missingPerms = botPerms.missing(command.botPermissions);
        return {
          status: false,
          message: t("errors:NO_PERMS_BOT", {
            PERMISSIONS: parsePerms(missingPerms as Permission[]),
          }),
        };
      }
    }
  }

  // Handle Validations
  if (command.validations) {
    for (const validation of command.validations) {
      if (validation.type !== "message" && !validation.callback(interaction)) {
        return {
          status: false,
          message: validation.message,
        };
      }
    }
  }
  // Check cooldowns
  if (command?.cooldown && !client.config.OWNER.includes(interaction.user.id)) {
    const { cooldowns } = client;

    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = command.cooldown * 1000;

    if (timestamps?.has(interaction.user.id)) {
      const expirationTime = (timestamps.get(interaction.user.id) as number) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000);
        return {
          status: false,
          message: t("errors:COOLDOWN", {
            COMMAND: `</${interaction.commandName}:${interaction.commandId}>`,
            TIME: `<t:${expiredTimestamp}:R>`,
          }),
        };
      }
    }

    timestamps?.set(interaction.user.id, now);
    setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);
  }

  return {
    status: true,
  };
}

/**
 * Validates message commands if it passes a set of checks.
 *
 * @param command - The command object that contains the details of the command to validate against.
 * @param message - The message object that needs to be validated. This is a partial group DM channel message.
 * @param args - The arguments passed to the command.
 * @param prefix - The prefix used to invoke the command.
 * @param flags - The flags object that contains the flags passed to the command.
 * @param t - The translation function used for localization.
 */
export function validateMessage(
  command: Command,
  message: OmitPartialGroupDMChannel<Message>,
  args: string[],
  prefix: string,
  flags: Flags,
  t: ReturnType<typeof import("../i18n.js").getTranslator>,
): { status: boolean; message?: string | MessageCreateOptions } {
  // Check send permission(s);
  if (message.inGuild() && !message.guild.members.me?.permissionsIn(message.channel).has(["SendMessages", "ViewChannel"])) {
    return {
      status: false,
      message: t("errors:MESSAGE_BOT_NO_PERM", {
        PERMISSIONS: `${parsePerms("SendMessages")}/${parsePerms("ViewChannel")}`,
        SERVER: message.guild.name,
        CHANNEL: message.channel,
        COMMAND: command.name,
      }),
    };
  }
  if (command.prefix?.guildOnly && !message.inGuild()) return { status: false };

  // Check if the user has permissions to use the command.
  if (message.guild && command.userPermissions && !message.member?.permissions.has(command.userPermissions)) {
    return {
      status: false,
      message: t("errors:NO_PERMS_USER", {
        PERMISSIONS: parsePerms(command.userPermissions as Permission[]),
      }),
    };
  }
  // Check if args are valid
  if (
    (command.prefix?.minimumArgs && args.length < command.prefix.minimumArgs) ||
    (command.prefix?.subcommands && args[0] && !command.prefix.subcommands.find((sub) => sub.trigger.startsWith(args[0])))
  ) {
    return {
      status: false,
      message: {
        ...(args.length < (command.prefix.minimumArgs || 0) && {
          content: t("errors:MINIMUM_ARGS", { LIMIT: command.prefix.minimumArgs }),
        }),

        embeds: [
          {
            title: t("errors:INVALID_USAGE"),
            description:
              (command.prefix.usage ? `Usage:\n**\`${prefix}${command.name} ${command.prefix.usage}\`**\n\n` : "") +
              (command.prefix.subcommands
                ? "**Subcommands:**\n" +
                  command.prefix.subcommands
                    .map((sub) => `**\`${prefix}${command.name} ${sub.trigger}\`**\n ↪ ${sub.description}`)
                    .join("\n")
                : ""),
            author: {
              name: `${command.name} Command`,
              icon_url: message.client.user.displayAvatarURL(),
            },
            color: resolveColor("Random"),
          },
        ],
      },
    };
  }

  // Check for validations
  if (command.validations?.length) {
    for (const validation of command.validations) {
      if (validation.type !== "interaction" && !validation.callback(message, { args, flags, commandName: command.name })) {
        return {
          status: false,
          message: validation.message,
        };
      }
    }
  }

  // Check cooldowns
  if (command?.cooldown && !message.client.config.OWNER.includes(message.author.id)) {
    const { cooldowns } = message.client;

    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = command.cooldown * 1000;

    if (timestamps?.has(message.author.id)) {
      const expirationTime = (timestamps.get(message.author.id) as number) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000);
        return {
          status: false,
          message: t("errors:COOLDOWN", {
            COMMAND: command.name,
            TIME: `<t:${expiredTimestamp}:R>`,
          }),
        };
      }
    }

    timestamps?.set(message.author.id, now);
    setTimeout(() => timestamps?.delete(message.author.id), cooldownAmount);
  }

  // Check bot perms
  if (message.inGuild() && command.botPermissions) {
    let toCheck = true;
    const perms = message.guild.members.me!.permissions;
    const missing = perms.missing(command.botPermissions);
    if (command.forSubs) {
      toCheck = command.forSubs.includes(args[0]);
    }
    if (toCheck && !perms.has(command.botPermissions)) {
      return {
        status: false,
        message: t("errors:NO_PERMS_BOT", {
          PERMISSIONS: parsePerms(missing as Permission[]),
        }),
      };
    }
  }
  return {
    status: true,
  };
}
