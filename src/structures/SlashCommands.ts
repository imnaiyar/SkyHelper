import type {
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  PermissionResolvable,
  APIApplicationCommandOption,
} from "discord.js";

import type { IntegrationTypes, ContextTypes } from "#libs/types";
import type { SkyHelper } from "#structures";
/* eslint-disable */

export interface SlashCommand<Autocomplete extends boolean = false> {
  /**
   * Slash Command API data
   */
  data: {
    /**
     * Name of the command, must be lowercase string with no spaces.
     */
    name: string;

    /**
     * Description of the command
     */
    description: string;

    /**
     * Command options in an array
     */
    options?: APIApplicationCommandOption[];

    /**
     * Type of the command
     */
    type?: number;

    /**
     * Command's {@link https://discord.com/developers/docs/resources/application#application-object-application-integration-types integration_types}
     */
    integration_types?: IntegrationTypes[];

    /** Command's {@link https://discord.com/developers/docs/interactions/application-commands#interaction-contexts contexts} */
    contexts?: ContextTypes[];

    /** User permissions required to use this command */
    userPermissions?: PermissionResolvable[];

    /** Permissions bot requires for this command */
    botPermissions?: PermissionResolvable[];
  };
  /* Command category */
  category?: string;

  /* Whether or not the command is owner only */
  ownerOnly?: boolean;

  /* Command cooldown */
  cooldown?: number;

  /** The callback function to run when the command is used */
  execute: (interaction: ChatInputCommandInteraction, client: SkyHelper) => Promise<void>;

  /** Autocomplete callback if it exists */
  autocomplete?: Autocomplete extends true ? (interaction: AutocompleteInteraction, client: SkyHelper) => Promise<void> : never;
}
