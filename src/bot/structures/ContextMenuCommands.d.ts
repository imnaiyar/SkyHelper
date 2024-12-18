import type {
  ApplicationCommandType,
  UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  PermissionResolvable,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from "discord.js";
import type { SkyHelper } from "#structures/SkyHelper";
import type { OverrideLocalizations, Validation } from "./Command.js";
/* eslint-disable */

export interface ContextMenuCommand<T extends "UserContext" | "MessageContext"> {
  name: string;
  data: Omit<OverrideLocalizations<RESTPostAPIContextMenuApplicationCommandsJSONBody>, "name"> & {
    type: T extends "UserContext" ? ApplicationCommandType.User : ApplicationCommandType.Message;
    guilds?: string[];
  };
  userPermissions?: PermissionResolvable[];
  botPermissions?: PermissionResolvable[];
  ownerOnly?: boolean;
  validations?: Validation[];
  cooldown?: number;

  execute(
    interaction: T extends "UserContext" ? UserContextMenuCommandInteraction : MessageContextMenuCommandInteraction,
    client: SkyHelper,
  ): Promise<void>;
}
