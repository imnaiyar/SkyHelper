import type { Command, ContextMenuCommand, SkyHelper } from "@/structures";
import { Collection } from "@discordjs/collection";
import {
  ApplicationCommandType,
  type APIChatInputApplicationCommandInteraction,
  type APIContextMenuInteraction,
  type APITextChannel,
  type GatewayMessageCreateDispatchData,
  type RESTPostAPIChannelMessageJSONBody,
} from "@discordjs/core";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
import { parsePerms, resolveColor, type Permission } from "@skyhelperbot/utils";
import type { MessageFlags } from "./classes/MessageFlags.js";
import { PermissionsUtil } from "./classes/PermissionUtils.js";
import logger from "@/handlers/logger";
import type { InteractionHelper } from "./classes/InteractionUtil.js";

// #region env
export function validateEnv() {
  if (!process.env.TOKEN) throw new Error("TOKEN is not provided in the environment variables");
  if (!process.env.MONGO_CONNECTION) throw new Error("MONGO_CONNECTION is not provided in the environment variables");
  if (!process.env.CLIENT_ID) throw new Error("CLIENT_ID is not provided in the environment variables");
  if (!process.env.SENTRY_DSN) throw new Error("SENTRY_DSN is not provided in the environment variables");
  if (!process.env.PUBLIC_KEY) throw new Error("PUBLIC_KEY is not provided in the environment variables");
  if (!process.env.CONTACT_US) logger.warn("CONTACT_US Webhook is not provided, command '/contact-us' will not work properly");
  for (const key of ["TOPGG_TOKEN", "DBL_TOKEN"]) {
    // prettier-ignore
    if (!process.env[key]) logger.warn(`${key} is not provided in the environment variables, the bot will not be able to post stats`);
  }
}

// #region interaction
type ValidateInteractionOptions = {
  command: Command | ContextMenuCommand<"MessageContext" | "UserContext">;
  interaction: APIChatInputApplicationCommandInteraction | APIContextMenuInteraction;
  options: InteractionOptionResolver;
  helper: InteractionHelper;
  t: ReturnType<typeof import("../i18n.js").getTranslator>;
};

/**
 * Validates interactions if it passes a set of checks
 */
export async function validateInteractions({ command, interaction, options, helper, t }: ValidateInteractionOptions): Promise<
  | {
      status: false;
      message: string;
    }
  | {
      status: true;
    }
> {
  const { client, user } = helper;

  // Handle owner commands
  if (command.ownerOnly && !client.config.OWNER.includes(user.id)) {
    return {
      status: false,
      message: "This command is for owner(s) only.",
    };
  }
  // Handle command user required permissions
  if (command.userPermissions) {
    if (interaction.guild_id) {
      if (!client.permUtils(command.userPermissions)) {
        return {
          status: false,
          message: t("errors:NO_PERMS_USER", {
            PERMISSIONS: parsePerms(command.userPermissions as Permission[]),
          }),
        };
      }
    }
  }

  // Handle bot's required permissions
  if (interaction.guild_id && command.botPermissions) {
    let toCheck = true;
    if ("description" in command && command.forSubs && interaction.data.type === ApplicationCommandType.ChatInput) {
      const sub = options.getSubcommand(true);
      toCheck = command.forSubs.includes(sub);
    }
    if (toCheck) {
      // Not cached means bot is not added as a user and it'll not have any permissions
      if (!client.guilds.has(interaction.guild_id)) {
        return {
          status: false,
          message: t("errors:NOT_A_SERVER"),
        };
      }

      const botPerms = client.permUtils(interaction.app_permissions as `${number}`);

      if (toCheck && !botPerms.has(command.botPermissions)) {
        const missingPerms = client.permUtils(botPerms.bitfield).missing(command.botPermissions);
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
      if (validation.type !== "message") {
        // @ts-expect-error Mismatching between chatinput and context, don't wanna impl a complex solution so just ignore
        const validated = await validation.callback({ interaction, options, t, helper });
        if (validated.status === false) {
          return {
            status: false,
            message: validated.message,
          };
        }
      }
    }
  }
  // Check cooldowns
  if (command?.cooldown && !client.config.OWNER.includes(user.id)) {
    const { cooldowns } = client;

    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = command.cooldown * 1000;

    if (timestamps?.has(user.id)) {
      const expirationTime = (timestamps.get(user.id) as number) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000);
        return {
          status: false,
          message: t("errors:COOLDOWN", {
            COMMAND: `</${interaction.data.name}:${interaction.data.id}>`,
            TIME: `<t:${expiredTimestamp}:R>`,
          }),
        };
      }
    }

    timestamps?.set(user.id, now);
    setTimeout(() => timestamps?.delete(user.id), cooldownAmount);
  }

  return {
    status: true,
  };
}

// #region Message
type ValidateMessageOptions = {
  command: Command;
  message: GatewayMessageCreateDispatchData;
  args: string[];
  prefix: string;
  flags: MessageFlags;
  client: SkyHelper;
  t: ReturnType<typeof import("../i18n.js").getTranslator>;
};

/**
 * Validates message commands if it passes a set of checks.
 *
 */
export async function validateMessage({ command, message, args, prefix, flags, client, t }: ValidateMessageOptions): Promise<{
  status: boolean;
  message?: RESTPostAPIChannelMessageJSONBody;
}> {
  const guild = message.guild_id ? client.guilds.get(message.guild_id)! : null;
  // Check send permission(s);
  if (message.guild_id) {
    const channel = client.channels.get(message.channel_id)!;
    const botPerms = PermissionsUtil.overwriteFor(guild!.clientMember, channel as APITextChannel, client);

    if (!botPerms.has(["SendMessages", "ViewChannel"])) {
      const dm = await client.api.users.createDM(message.author.id);

      // Bot nO pErMs, notify AuThOr
      await client.api.channels.createMessage(dm.id, {
        content: t("errors:MESSAGE_BOT_NO_PERM", {
          PERMISSIONS: `${parsePerms("SendMessages")}/${parsePerms("ViewChannel")}`,
          SERVER: guild!.name,
          CHANNEL: `<#${channel.id}>`,
          COMMAND: command.name,
        }),
      });

      return {
        status: false,
      };
    }
  }
  if (command.prefix?.guildOnly && !message.guild_id) return { status: false };

  // Check if the user has permissions to use the command.
  if (
    message.guild_id &&
    command.userPermissions &&
    message.member &&
    !PermissionsUtil.permissionsFor(message.member, guild!).has(command.userPermissions)
  ) {
    return {
      status: false,
      message: {
        content: t("errors:NO_PERMS_USER", {
          PERMISSIONS: parsePerms(command.userPermissions as Permission[]),
        }),
      },
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
              icon_url: client.utils.getUserAvatar(client.user),
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
      if (validation.type !== "interaction") {
        const validated = await validation.callback({ message, t, commandName: command.name, flags, args, client });
        if (!validated.status) {
          return {
            status: false,
            message: { content: validated.message },
          };
        }
      }
    }
  }

  // Check cooldowns
  if (command?.cooldown && !client.config.OWNER.includes(message.author.id)) {
    const { cooldowns } = client;

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
          message: {
            content: t("errors:COOLDOWN", {
              COMMAND: command.name,
              TIME: `<t:${expiredTimestamp}:R>`,
            }),
          },
        };
      }
    }

    timestamps?.set(message.author.id, now);
    setTimeout(() => timestamps?.delete(message.author.id), cooldownAmount);
  }

  // Check bot perms
  if (message.guild_id && command.botPermissions) {
    let toCheck = true;
    const channel = client.channels.get(message.channel_id)!;
    const perms = PermissionsUtil.overwriteFor(guild!.clientMember, channel as APITextChannel, client);
    const missing = perms.missing(command.botPermissions);
    if (command.forSubs) {
      toCheck = command.forSubs.includes(args[0]);
    }
    if (toCheck && !perms.has(command.botPermissions)) {
      return {
        status: false,
        message: {
          content: t("errors:NO_PERMS_BOT", {
            PERMISSIONS: parsePerms(missing as Permission[]),
          }),
        },
      };
    }
  }
  return {
    status: true,
  };
}
