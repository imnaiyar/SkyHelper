import {
  ContextMenuCommandInteraction,
  ApplicationCommandType,
  UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
} from "discord.js";
import { IntegrationTypes, ContextTypes, ContextMenuType, UserContext, MessageContext } from "#libs/types";
/* eslint-disable */

export interface ContextMenuCommand<Type extends ContextMenuType = null> {
  data: {
    name: string;
    type: typeof ApplicationCommandType.User | typeof ApplicationCommandType.Message;
    integration_types?: IntegrationTypes[];
    contexts?: ContextTypes[];
  };

  execute(
    interaction: Type extends UserContext
      ? UserContextMenuCommandInteraction
      : Type extends MessageContext
        ? MessageContextMenuCommandInteraction
        : ContextMenuCommandInteraction,
  ): void;
}
