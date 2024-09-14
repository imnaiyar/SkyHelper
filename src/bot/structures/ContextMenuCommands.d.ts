import type {
  ApplicationCommandType,
  UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  PermissionResolvable,
  ApplicationIntegrationType,
  InteractionContextType,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from "discord.js";
import type { SkyHelper } from "#structures/SkyHelper";
/* eslint-disable */

export interface ContextMenuCommand<T extends "UserContext" | "MessageContext"> {
  name: string;
  data: Omit<RESTPostAPIContextMenuApplicationCommandsJSONBody, "name"> & {
    type: T extends "UserContext" ? ApplicationCommandType.User : ApplicationCommandType.Message;
  };
  userPermissions?: PermissionResolvable[];
  botPermissions?: PermissionResolvable[];
  ownerOnly?: boolean;
  cooldown?: number;

  execute(
    interaction: T extends "UserContext" ? UserContextMenuCommandInteraction : MessageContextMenuCommandInteraction,
    client: SkyHelper,
  ): Promise<void>;
}
