import type { Message, OmitPartialGroupDMChannel } from "discord.js";
import type { Permission } from "skyhelper-utils/dist/utils/parsePerms.js";
import type { Flags } from "#libs";
import type { SkyHelper } from "#structures";
/* eslint-disable */

type MessageParams = {
  message: OmitPartialGroupDMChannel<Message>;
  args: string[];
  flags: Flags;
  client: SkyHelper;
};
/** Structure of command validation */
export interface Validation {
  /** Message to display when validation fails */
  message: string;

  /** Callback for the validation */
  callback(msg: OmitPartialGroupDMChannel<Message>): boolean;
}

export interface PrefixSubcommand {
  trigger: string;
  description: string;
}

/** Prefix command structure */
export type PrefixCommand = {
  /** Command data */
  data: {
    /** Name of the command in lowercase string and no spaces */
    name: string;

    /** Description of the command */
    description: string;

    /** Args of the command */
    args?: {
      required?: boolean;
      /**Mininum args require */
      minimum?: number;

      subcommand?: PrefixSubcommand[];
    };

    /** Flags for the command */
    flags?: string[];

    /** Aliases for the command */
    aliases?: string[];

    /** The command category */
    category?: string;

    ownerOnly?: boolean;

    /** Permissions of the user required for the command */
    userPermissions?: Permission[];

    /** Permissions of the bot required for the command */
    botPermissions?: Permission[];
  };

  /** Command cooldown */
  cooldown?: number;

  /** Any validations for the command */
  validations?: Validation[];

  /** Callback function to run when the command is used */
  execute: (params: MessageParams) => Promise<void>;
};
