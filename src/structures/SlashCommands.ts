import type {
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  PermissionResolvable,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

import type { IntegrationTypes, ContextTypes } from "#libs";
import type { SkyHelper } from "#structures";
import type { getTranslator } from "#src/i18n";
/* eslint-disable */

export interface SlashCommand<Autocomplete extends boolean = false> {
  /**
   * Slash Command API data
   */
  data: RESTPostAPIChatInputApplicationCommandsJSONBody & {
    integration_types?: IntegrationTypes[];
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

  /* Whether the command should be skipped deploying */
  skipDeploy?: boolean;

  /* Command cooldown */
  cooldown?: number;

  /** The callback function to run when the command is used */
  execute: (interaction: ChatInputCommandInteraction, t: ReturnType<typeof getTranslator>, client: SkyHelper) => Promise<void>;

  /** Autocomplete callback if it exists */
  autocomplete?: Autocomplete extends true ? (interaction: AutocompleteInteraction, client: SkyHelper) => Promise<void> : never;
}
