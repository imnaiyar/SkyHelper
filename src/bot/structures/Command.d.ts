import type {
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  PermissionResolvable,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  OmitPartialGroupDMChannel,
  Message,
  ContextMenuCommandInteraction,
  MessageCreateOptions,
} from "discord.js";

import type { SkyHelper } from "#structures";
import type { getTranslator, LangKeys } from "#bot/i18n";
import type { Category } from "./Category.ts";

export type OverrideLocalizations<T> = T extends (infer U)[]
  ? OverrideLocalizations<U>[]
  : T extends object
    ? {
        [K in keyof T]: K extends "description_localizations" | "name_localizations" ? LangKeys : OverrideLocalizations<T[K]>; // Recursively process nested objects
      }
    : T;

type MessageParams = {
  message: OmitPartialGroupDMChannel<Message>;
  args: string[];
  flags: Flags;
  t: ReturnType<typeof getTranslator>;
  client: SkyHelper;
};

type ValidationReturn = { status: true } | { status: false; message: string };
/** Structure of command validation */
export interface ValidationBase {
  type: "both";

  /** Callback for the validation. */
  callback(
    intOrMsg: OmitPartialGroupDMChannel<Message> | ChatInputCommandInteraction,
    t: ReturnType<typeof getTranslator>,
    messageOptions?: Omit<MessageParams, "message" | "client" | "t"> & { commandName: string },
  ): ValidationReturn;
}

export interface MessageValidation extends ValidationBase {
  /** Indicates this validation is for message-based commands */
  type: "message";

  /** Callback for the validation. */
  callback(
    intOrMsg: OmitPartialGroupDMChannel<Message>,
    t: ReturnType<typeof getTranslator>,
    messageOptions: Omit<MessageParams, "message" | "client" | "t"> & { commandName: string },
  ): ValidationReturn;
}

export interface InteractionValidation<IsContext extends boolean = false> extends ValidationBase {
  /** Indicates this validation is for interaction-based commands */
  type: "interaction";

  /** Callback for the validation. */
  callback(
    intOrMsg: IsContext extends true ? ContextMenuCommandInteraction : ChatInputCommandInteraction,
    t: ReturnType<typeof getTranslator>,
  ): ValidationReturn;
}

export type Validation = MessageValidation | InteractionValidation | ValidationBase;

export interface PrefixSubcommand {
  trigger: string;
  description: string;
}

interface CommandBase {
  /** Name of the command */
  name: string;

  /** Description of the command */
  description: string;

  prefix?: {
    /** Mininum args require */
    minimumArgs?: number;

    /** Usage example for the command */
    usage?: string;

    /** Subcommands */
    subcommands?: PrefixSubcommand[];

    /** Flags for the command */
    flags?: string[];

    /** Whether this prefix command is only usable in a guild */
    guildOnly?: boolean;

    /** Aliases for the command */
    aliases?: string[];
  };
  /**
   * Slash Command API data
   */
  data?: Omit<OverrideLocalizations<RESTPostAPIChatInputApplicationCommandsJSONBody>, "name" | "description"> & {
    /** Array of guild Ids this command will be deployed to,
     * if present, the command in not deployed globally but only for the specified guilds */
    guilds?: string[];
  };
  /* Command category */
  category: (typeof Category)[number]["name"];

  userPermissions?: PermissionResolvable[];

  /** Permissions bot requires for this command */
  botPermissions?: PermissionResolvable[];

  /** If present, permissions will only be checked for subcomaands present in the array */
  forSubs?: string[];

  /* Whether or not the command is owner only */
  ownerOnly?: boolean;

  /* Whether the command should be skipped deploying */
  skipDeploy?: boolean;

  /** Any validations for the command */
  validations?: Validation[];

  /* Command cooldown */
  cooldown?: number;
}

export type Command<Autocomplete extends boolean = false> = (Autocomplete extends true
  ? CommandBase & {
      /** Autocomplete callback if it exists */
      autocomplete: (interaction: AutocompleteInteraction, client: SkyHelper) => Promise<void>;
    }
  : CommandBase) &
  (
    | {
        /** The callback function to run when the command is used */
        interactionRun: (
          interaction: ChatInputCommandInteraction,
          t: ReturnType<typeof getTranslator>,
          client: SkyHelper,
        ) => Promise<void>;

        messageRun: (options: MessageParams) => Promise<void>;
      }
    | {
        /** The callback function to run when the command is used */
        interactionRun: (
          interaction: ChatInputCommandInteraction,
          t: ReturnType<typeof getTranslator>,
          client: SkyHelper,
        ) => Promise<void>;
        messageRun?: never;
      }
    | {
        messageRun: (options: MessageParams) => Promise<void>;
        interactionRun?: never;
      }
  );
