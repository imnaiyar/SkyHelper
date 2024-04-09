import {
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  ApplicationCommandOption,
  PermissionResolvable,
} from "discord.js";
import { type SkyHelper } from "./SkyHelper";

import { IntegrationTypes, ContextTypes } from "#libs/types";
/* eslint-disable */

export interface SlashCommand<Autocomplete extends boolean = false> {
  /**
   * Slash Command API dat
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
    options?: ApplicationCommandOption[];

    /**
     * TYpe of the command
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

  /* Command cooldown */
  cooldown?: number;

  /** The callback function to run when the command is used */
  execute: (interaction: ChatInputCommandInteraction, client: SkyHelper) => Promise<void>;

  /** Autocomplete callback if it exists */
  autocomplete?: Autocomplete extends true
    ? (interaction: AutocompleteInteraction, client: SkyHelper) => Promise<void>
    : never;
}
