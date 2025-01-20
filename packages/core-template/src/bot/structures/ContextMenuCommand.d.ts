import type {
  ApplicationCommandType,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
  APIUserApplicationCommandInteraction,
  APIMessageApplicationCommandInteraction,
} from "@discordjs/core";
import type { SkyHelper } from "./Client.ts";
import type { InteractionValidation } from "./Command.js";
import type { Category } from "./Category.ts";
import { PermissionsResolvable } from "@/utils/PermissionUtils";
import type { OverrideLocalizations } from "@/types/utils";
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
    client: SkyHelper,
  ): Promise<void>;
}
