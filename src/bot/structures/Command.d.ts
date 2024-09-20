import type {
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  PermissionResolvable,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  OmitPartialGroupDMChannel,
  Message,
  ContextMenuCommandInteraction,
} from "discord.js";

import type { SkyHelper } from "#structures";
import type { getTranslator } from "#bot/i18n";

type MessageParams = {
  message: OmitPartialGroupDMChannel<Message>;
  args: string[];
  flags: Flags;
  t: ReturnType<typeof getTranslator>;
  client: SkyHelper;
};

/** Structure of command validation */
export interface ValidationBase {
  /** Message to display when validation fails */
  message: string;
}

export interface MessageValidation extends ValidationBase {
  /** Indicates this validation is for message-based commands */
  type: "message";

  /** Callback for the validation. */
  callback(
    intOrMsg: OmitPartialGroupDMChannel<Message>,
    messageOptions: Omit<MessageParams, "message" | "client" | "t"> & { commandName: string },
  ): boolean;
}

export interface InteractionValidation extends ValidationBase {
  /** Indicates this validation is for interaction-based commands */
  type: "interaction";

  /** Callback for the validation. */
  callback(intOrMsg: ChatInputCommandInteraction | ContextMenuCommandInteraction): boolean;
}

export interface CommonValidation extends ValidationBase {
  type: "both";

  /** Callback for the validation. */
  callback(
    intOrMsg: OmitPartialGroupDMChannel<Message> | ChatInputCommandInteraction | ContextMenuCommandInteraction,
    messageOptions?: Omit<MessageParams, "message" | "client" | "t"> & { commandName: string },
  ): boolean;
}

export type Validation = MessageValidation | InteractionValidation | CommonValidation;

export interface PrefixSubcommand {
  trigger: string;
  description: string;
}

export interface Command<Autocomplete extends boolean = false> {
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
  slash?: Omit<RESTPostAPIChatInputApplicationCommandsJSONBody, "name" | "description"> & {
    /** User permissions required to use this command */
  };
  /* Command category */
  category?: string;

  userPermissions?: PermissionResolvable[];

  /** Permissions bot requires for this command */
  botPermissions?: PermissionResolvable[];

  /* Whether or not the command is owner only */
  ownerOnly?: boolean;

  /* Whether the command should be skipped deploying */
  skipDeploy?: boolean;

  /** Any validations for the command */
  validations?: Validation[];

  /* Command cooldown */
  cooldown?: number;

  /** The callback function to run when the command is used */
  interactionRun?: (
    interaction: ChatInputCommandInteraction,
    t: ReturnType<typeof getTranslator>,
    client: SkyHelper,
  ) => Promise<void>;

  /** Autocomplete callback if it exists */
  autocomplete?: Autocomplete extends true ? (interaction: AutocompleteInteraction, client: SkyHelper) => Promise<void> : never;

  messageRun?: (options: MessageParams) => Promise<void>;
}