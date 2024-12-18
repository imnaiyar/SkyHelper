import type { Command, ContextMenuCommand, OverrideLocalizations } from "#structures";
import {
  PermissionFlagsBits,
  type APIApplicationCommandOption,
  type APIApplicationCommandOptionChoice,
  type RESTPostAPIApplicationCommandsJSONBody,
} from "discord.js";
import { loadLocalization } from "./loaders.js";

/* Lot of ts-ignores here ik lol */

/**
 * Parses command and replace localizations to LocalicationMap and returns API compatible data
 *
 * @param command The command to parse
 */
export function parseCommands(command: Command | ContextMenuCommand<"UserContext" | "MessageContext">) {
  // @ts-ignore
  const cmd: RESTPostAPIApplicationCommandsJSONBody = {
    name: command.name,
    ...("description" in command && { description: command.description }),
    ...(command.userPermissions && {
      default_member_permissions: command.userPermissions
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
    // @ts-ignore Error because op contains different types for localizations which this function will override anyway
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
        // @ts-ignore Same reasoning as above
        const choice: APIApplicationCommandOptionChoice = { ...ch };

        if (ch.name_localizations) {
          // @ts-ignore Same reasoning
          choice.name_localizations = loadLocalization(ch.name_localizations);
        }

        cChoices.push(choice);
      }

      // @ts-ignore
      // override the choices
      option.choices = cChoices;
    }

    // @ts-ignore Same reasoning
    // Recursively map the options, if it exists
    if ("options" in option && option.options) option.options = _parseOptions(op.options);

    cOptions.push(option);
  }
  return cOptions;
}
