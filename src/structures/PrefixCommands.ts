import { Message } from "discord.js";
import { type SkyHelper } from "./SkyHelper";
import { type Permission } from "skyhelper-utils/dist/utils/parsePerms";
/* eslint-disable */

/** Structure of command validation */
export interface Validation {
  /** Message to display when validation fails */
  message: string;

  /** Callback for the validation */
  callback(msg: Message): boolean;
}

/** Prefix command structure */
export type PrefixCommand = {
  /** Command data */
  data: {
    /** Name of the command in lowercase string and no spaces */
    name: string;

    /** Description of the command */
    description: string;

    /** Flags for the command */
    flags?: string[];

    /** Aliases for the command */
    aliases?: string[];

    /** The command category */
    category?: string;

    /** Permissions of the user required for the command */
    userPermissions?: Permission[];

    /** Permissions of the bot required for the command */
    botPermissions?: Permission[];

    /** Any validations for the command */
    validations?: Validation[];
  };

  /** Callback function to run when the command is used */
  execute: (interaction: Message, client: SkyHelper) => void;
};
