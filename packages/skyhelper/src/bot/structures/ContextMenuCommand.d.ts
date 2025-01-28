import type {
  ApplicationCommandType,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
  APIUserApplicationCommandInteraction,
  APIMessageApplicationCommandInteraction,
} from "@discordjs/core";
import type { SkyHelper } from "./Client.ts";
import type { InteractionValidation } from "./Command.js";
import type { Category } from "./Category.ts";
import { PermissionsResolvable } from "@/utils/classes/PermissionUtils";
import type { OverrideLocalizations } from "@/types/utils";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
/* eslint-disable */

export interface ContextMenuCommand<T extends "UserContext" | "MessageContext"> {
  name: string;
  data: Omit<OverrideLocalizations<RESTPostAPIContextMenuApplicationCommandsJSONBody>, "name"> & {
    type: T extends "UserContext" ? ApplicationCommandType.User : ApplicationCommandType.Message;
    guilds?: string[];
  };
  userPermissions?: PermissionsResolvable;
  botPermissions?: PermissionsResolvable;
  ownerOnly?: boolean;
  validations?: InteractionValidation<true>[];
  cooldown?: number;
  category: (typeof Category)[number]["name"];

  execute(
    interaction: T extends "UserContext" ? APIUserApplicationCommandInteraction : APIMessageApplicationCommandInteraction,
    helper: InteractionHelper,
    t: ReturnType<typeof import("@/i18n").getTranslator>,
    options: InteractionOptionResolver,
  ): Promise<void>;
}
