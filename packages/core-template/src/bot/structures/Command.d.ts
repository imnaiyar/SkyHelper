import type {
  APIChatInputApplicationCommandInteraction,
  APIApplicationCommandAutocompleteInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  APIMessage,
  APIContextMenuInteraction,
  API,
} from "@discordjs/core";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
import type { SkyHelper } from "./Client.ts";
import type { Awaitable } from "../@types/utils.ts";
import type { getTranslator } from "@/i18n";
import type { LangKeys } from "@/@types/i18n.ts";
import type { PermissionsResolvable } from "../utils/PermissionUtils.ts";

export type OverrideLocalizations<T> = T extends (infer U)[]
  ? OverrideLocalizations<U>[]
  : T extends object
    ? {
        [K in keyof T]: K extends "description_localizations" | "name_localizations" ? LangKeys : OverrideLocalizations<T[K]>; // Recursively process nested objects
      }
    : T;

type MessageParams = {
  message: APIMessage;
  args: string[];
  flags: Flags;
  t: ReturnType<typeof getTranslator>;
  client: SkyHelper;
};

type ValidationReturn = { status: true } | { status: false; message: string };
export interface MessageValidation {
  type: "message";
  callback(opts: MessageParams): Awaitable<ValidationReturn>;
}
export interface InteractionValidation<IsContext extends boolean = false> {
  type: "interaction";
  /** Callback for the validation. */
  callback(
    opts: InteractionOptions<IsContext extends true ? APIContextMenuInteraction : APIChatInputApplicationCommandInteraction>,
  ): Awaitable<ValidationReturn>;
}
export type Validation = MessageValidation | InteractionValidation;
export interface PrefixSubcommand {
  trigger: string;
  description: string;
}

interface CommandBase {
  /** Name of the command */
  name: string;

  /** Description of the command */
  description: string;

  /** Prefix command is legacy and is not support, this is only here for owner commands */
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

  userPermissions?: PermissionsResolvable[];

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
type InteractionOptions<TType extends APIChatInputApplicationCommandInteraction | APIApplicationCommandAutocompleteInteraction> =
  {
    interaction: TType;
    api: API;
    client: SkyHelper;
    t: ReturnType<typeof getTranslator>;
    options: InteractionOptionResolver;
  };
export type Command<Autocomplete extends boolean = false> = (Autocomplete extends true
  ? CommandBase & {
      /** Autocomplete callback if it exists */
      autocomplete: (opt: InteractionOptions<APIApplicationCommandAutocompleteInteraction>) => Awaitable<void>;
    }
  : CommandBase) &
  (
    | {
        /** The callback function to run when the command is used */
        interactionRun: (opt: InteractionOptions<APIChatInputApplicationCommandInteraction>) => Awaitable<void>;

        messageRun: (options: MessageParams, api: API) => Awaitable<void>;
      }
    | {
        /** The callback function to run when the command is used */
        interactionRun: (opt: InteractionOptions<APIChatInputApplicationCommandInteraction>) => Awaitable<void>;
        messageRun?: never;
      }
    | {
        messageRun: (options: MessageParams, api: API) => Awaitable<void>;
        interactionRun?: never;
      }
  );
