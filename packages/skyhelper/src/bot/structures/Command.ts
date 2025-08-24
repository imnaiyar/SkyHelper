import type {
  APIChatInputApplicationCommandInteraction,
  APIApplicationCommandAutocompleteInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  APIContextMenuInteraction,
  API,
  GatewayMessageCreateDispatchData,
  APIApplicationCommandOption,
} from "@discordjs/core";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
import type { SkyHelper } from "./Client.js";
import type { Awaitable, OverrideLocalizations } from "@/types/utils";
import type { getTranslator } from "@/i18n";
import type { PermissionsResolvable } from "@/utils/classes/PermissionUtils";
import type { MessageFlags } from "@/utils/classes/MessageFlags";
import type { Category } from "./Category.js";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import type { CommandOptionsType } from "@/types/CommandOptions";
export type Options = readonly OverrideLocalizations<Readonly<APIApplicationCommandOption>>[];
type MessageParams = {
  message: GatewayMessageCreateDispatchData;
  args: string[];
  flags: MessageFlags;
  t: ReturnType<typeof getTranslator>;
  client: SkyHelper;
};

export type ValidationReturn = { status: true } | { status: false; message: string };
export interface MessageValidation {
  type: "message";
  callback(opts: MessageParams & { commandName: string }): Awaitable<ValidationReturn>;
}
export interface InteractionValidation<TOptions extends Options | undefined = undefined, IsContext extends boolean = false> {
  type: "interaction";
  /** Callback for the validation. */
  callback(
    opts: InteractionOptions<
      IsContext extends true ? APIContextMenuInteraction : APIChatInputApplicationCommandInteraction,
      TOptions
    >,
  ): Awaitable<ValidationReturn>;
}
export type Validation<T extends Options | undefined = undefined> = MessageValidation | InteractionValidation<T>;
export interface PrefixSubcommand {
  trigger: string;
  description: string;
}

interface CommandBase<TOptions extends Options | undefined = undefined> {
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
    /** Command options - used for type inference */
    options?: TOptions;
  };
  /* Command category */
  category: (typeof Category)[number]["name"];

  userPermissions?: PermissionsResolvable;

  /** Permissions bot requires for this command */
  botPermissions?: PermissionsResolvable;

  /** If present, permissions will only be checked for subcomaands present in the array */
  forSubs?: string[];

  /* Whether or not the command is owner only */
  ownerOnly?: boolean;

  /* Whether the command should be skipped deploying */
  skipDeploy?: boolean;

  /** Any validations for the command */
  validations?: Validation<TOptions>[];

  /* Command cooldown */
  cooldown?: number;
}

//  interaction options for commands with defined option structure
export type InteractionOptions<
  TType extends
    | APIChatInputApplicationCommandInteraction
    | APIApplicationCommandAutocompleteInteraction
    | APIContextMenuInteraction,
  TOptions extends Options | undefined = undefined,
> = {
  interaction: TType;
  helper: InteractionHelper;
  t: ReturnType<typeof getTranslator>;
  optionsResolver: InteractionOptionResolver;
  options: CommandOptionsType<TOptions>;
};

export type Command<
  TOptions extends Options | undefined = undefined,
  Autocomplete extends boolean = false,
> = (Autocomplete extends true
  ? CommandBase<TOptions> & {
      /** Autocomplete callback if it exists */
      autocomplete: (opt: InteractionOptions<APIApplicationCommandAutocompleteInteraction>) => Awaitable<void>;
    }
  : CommandBase<TOptions>) &
  (
    | {
        /** The callback function to run when the command is used */
        interactionRun: (opt: InteractionOptions<APIChatInputApplicationCommandInteraction, TOptions>) => Awaitable<void>;

        messageRun: (options: MessageParams, api: API) => Awaitable<void>;
      }
    | {
        /** The callback function to run when the command is used */
        interactionRun: (opt: InteractionOptions<APIChatInputApplicationCommandInteraction, TOptions>) => Awaitable<void>;
        messageRun?: never;
      }
    | {
        messageRun: (options: MessageParams, api: API) => Awaitable<void>;
        interactionRun?: never;
      }
  );

export const defineCommand = <T extends Options>(command: Command<T>) => command;

export const defineStructure = <T extends Options>(structure: Omit<Command<T>, "interactionRun" | "messageRun">) => structure;
