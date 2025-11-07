import type {
  ApplicationCommandType,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
  APIUserApplicationCommandInteraction,
  APIMessageApplicationCommandInteraction,
} from "@discordjs/core";
import type { InteractionValidation } from "./Command.js";
import type { Category } from "./Category.ts";
import { PermissionsResolvable } from "@skyhelperbot/utils";
import type { OverrideLocalizations } from "@/types/utils";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";

export interface ContextMenuCommand<T extends "UserContext" | "MessageContext"> {
  name: string;
  data: Omit<OverrideLocalizations<RESTPostAPIContextMenuApplicationCommandsJSONBody>, "name"> & {
    type: T extends "UserContext" ? ApplicationCommandType.User : ApplicationCommandType.Message;
    guilds?: string[];
  };
  userPermissions?: PermissionsResolvable;
  beta?: boolean;
  botPermissions?: PermissionsResolvable;
  ownerOnly?: boolean;
  validations?: Array<InteractionValidation<true>>;
  cooldown?: number;
  category: (typeof Category)[number]["name"];

  execute(
    interaction: T extends "UserContext" ? APIUserApplicationCommandInteraction : APIMessageApplicationCommandInteraction,
    helper: InteractionHelper,
    t: ReturnType<typeof import("@/i18n").getTranslator>,
    options: InteractionOptionResolver,
  ): Promise<void>;
}
