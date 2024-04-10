import {
  ContextMenuCommandInteraction,
  ApplicationCommandType,
  UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  PermissionResolvable,
} from "discord.js";
import { IntegrationTypes, ContextTypes, ContextMenuType } from "#libs/types";
import { SkyHelper } from "#structures/SkyHelper";
/* eslint-disable */

export interface ContextMenuCommand<T extends ContextMenuType = null> {
  data: {
    name: string;
    type: typeof ApplicationCommandType.User | typeof ApplicationCommandType.Message;
    integration_types?: IntegrationTypes[];
    contexts?: ContextTypes[];
    userPermissions?: PermissionResolvable[];
    botPermissions?: PermissionResolvable[];
  };
  ownerOnly?: boolean;
  cooldown?: number;

  execute(
    interaction: T extends "UserContext"
      ? UserContextMenuCommandInteraction
      : T extends "MessageContext"
        ? MessageContextMenuCommandInteraction
        : ContextMenuCommandInteraction,
    client: SkyHelper,
  ): Promise<void>;
}
