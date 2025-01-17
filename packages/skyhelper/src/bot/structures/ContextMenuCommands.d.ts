import type {
  ApplicationCommandType,
  UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  PermissionResolvable,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from "discord.js";
import type { SkyHelper } from "#structures/SkyHelper";
import type { InteractionValidation, OverrideLocalizations } from "./Command.js";
import type { Category } from "./Category.ts";
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
  validations?: InteractionValidation<true>[];
  cooldown?: number;
  category: (typeof Category)[number]["name"];

  execute(
    interaction: T extends "UserContext" ? UserContextMenuCommandInteraction : MessageContextMenuCommandInteraction,
    client: SkyHelper,
  ): Promise<void>;
}
