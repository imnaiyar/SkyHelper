import type {
  ApplicationCommandType,
  UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  PermissionResolvable,
  ApplicationIntegrationType,
  InteractionContextType,
} from "discord.js";
import type { SkyHelper } from "#structures/SkyHelper";
/* eslint-disable */

export interface ContextMenuCommand<T extends "UserContext" | "MessageContext"> {
  data: {
    name: string;
    type: T extends "UserContext" ? typeof ApplicationCommandType.User : typeof ApplicationCommandType.Message;
    integration_types?: ApplicationIntegrationType[];
    contexts?: InteractionContextType[];
    userPermissions?: PermissionResolvable[];
    botPermissions?: PermissionResolvable[];
  };
  ownerOnly?: boolean;
  cooldown?: number;

  execute(
    interaction: T extends "UserContext" ? UserContextMenuCommandInteraction : MessageContextMenuCommandInteraction,
    client: SkyHelper,
  ): Promise<void>;
}
