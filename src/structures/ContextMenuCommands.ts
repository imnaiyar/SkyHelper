import {
  ContextMenuCommandInteraction,
  ApplicationCommandType,
  UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  PermissionResolvable,
} from "discord.js";
import { IntegrationTypes, ContextTypes, ContextMenuType, UserContext, MessageContext } from "#libs/types";
import { SkyHelper } from "#structures/SkyHelper";
/* eslint-disable */

export interface ContextMenuCommand<Type extends ContextMenuType = null> {
  data: {
    name: string;
    type: typeof ApplicationCommandType.User | typeof ApplicationCommandType.Message;
    integration_types?: IntegrationTypes[];
    contexts?: ContextTypes[];
    userPermissions?: PermissionResolvable[];
    botPermissions?: PermissionResolvable[];
  };
  category?: string;
  cooldown?: number;

  execute(
    interaction: Type extends UserContext
      ? UserContextMenuCommandInteraction
      : Type extends MessageContext
        ? MessageContextMenuCommandInteraction
        : ContextMenuCommandInteraction,
    client: SkyHelper,
  ): Promise<void>;
}
