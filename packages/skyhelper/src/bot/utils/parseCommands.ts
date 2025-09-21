import type { Command, ContextMenuCommand } from "@/structures";

import { loadLocalization } from "./loaders.js";
import {
  PermissionFlagsBits,
  type APIApplicationCommandOption,
  type RESTPostAPIApplicationCommandsJSONBody,
} from "@discordjs/core";
import type { OverrideLocalizations } from "@/types/utils";

/* Lot of ts-ignores here ik lol */

/**
 * Parses command and replace localizations to LocalicationMap and returns API compatible data
 *
 * @param command The command to parse
 */
export function parseCommands(command: Command | ContextMenuCommand<"UserContext" | "MessageContext">) {
  // @ts-expect-error different types conflicting but it is correct
  const cmd: RESTPostAPIApplicationCommandsJSONBody = {
    name: command.name,
    ...("description" in command && { description: command.description }),
    ...(command.userPermissions && {
      default_member_permissions: (command.userPermissions as string[])
        .reduce(
          (accumulator: bigint, permission) => accumulator | PermissionFlagsBits[permission as keyof typeof PermissionFlagsBits],
          BigInt(0),
        )
        .toString(),
    }),
    ...("data" in command && command.data),
  };

  // handle localizations for slash commands
  if (command.data) {
    if (command.data.description_localizations) {
      cmd.description_localizations = loadLocalization(command.data.description_localizations);
    }
    if (command.data.name_localizations) {
      cmd.name_localizations = loadLocalization(command.data.name_localizations);
    }
    if (command.data.options) {
      cmd.options = _parseOptions(command.data.options);
    }
  }

  return cmd;
}

/**
 *
 * @param options The options to parse
 * @returns API compatible options
 */
function _parseOptions(options: OverrideLocalizations<Required<RESTPostAPIApplicationCommandsJSONBody>["options"]>) {
  const cOptions: APIApplicationCommandOption[] = [];

  // Map the options
  for (const op of options) {
    // @ts-expect-error Error because op contains different types for localizations which this function will override anyway
    const option: APIApplicationCommandOption = { ...op };

    // name
    if (op.name_localizations) {
      option.name_localizations = loadLocalization(op.name_localizations);
    }

    // description
    if (op.description_localizations) {
      option.description_localizations = loadLocalization(op.description_localizations);
    }

    // map the choices
    if ("choices" in option && option.choices) {
      const cChoices = [];

      for (const ch of option.choices) {
        // @ts-expect-error Same reasoning as above
        const choice: APIApplicationCommandOptionChoice = { ...ch };

        if (ch.name_localizations) {
          // @ts-expect-error Same reasoning
          choice.name_localizations = loadLocalization(ch.name_localizations);
        }

        cChoices.push(choice);
      }

      // override the choices
      option.choices = cChoices;
    }

    // @ts-expect-error Same reasoning
    // Recursively map the options, if it exists
    if ("options" in option && option.options) option.options = _parseOptions(op.options);

    cOptions.push(option);
  }
  return cOptions;
}
