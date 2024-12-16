import type { Command, ContextMenuCommand, OverrideLocalizations } from "#structures";
import { PermissionFlagsBits, type RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import { loadLocalization } from "./loaders.js";
/* TODO: Do a better job of naming variables, 
something to think about in the future */

/**
 * Parses command and replace localizations to LocalicationMap and returns API compatible data
 *
 * @param command The command to parse
 */
export function parseCommands(command: Command | ContextMenuCommand<"UserContext" | "MessageContext">) {
  const cmd: Record<string, any> = {
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
    ...("slash" in command && command.slash),
    ...("data" in command && command.data),
    ...("data" in command ? { type: command.data.type } : { type: 1 }), // Override type in case it's slash command
  };

  // handle localizations for slash commands
  if ("slash" in command && command.slash) {
    if (command.slash.description_localizations) {
      cmd.description_localizations = loadLocalization(command.slash.description_localizations);
    }
    if (command.slash.name_localizations) {
      cmd.name_localizations = loadLocalization(command.slash.name_localizations);
    }
    if (command.slash.options) {
      cmd.options = parseOptions(command.slash.options);
    }
  }

  // Context menu only have localizations for name
  if ("data" in command && command.data.name_localizations) {
    cmd.name_localizations = loadLocalization(command.data.name_localizations);
  }
  return cmd;
}

function parseOptions(options: OverrideLocalizations<Required<RESTPostAPIApplicationCommandsJSONBody>["options"]>) {
  const opt: Record<string, any>[] = [];

  // Map the options
  for (const op of options) {
    const o: Record<string, any> = { ...op };

    // name
    if (op.name_localizations) {
      o.name_localizations = loadLocalization(op.name_localizations);
    }

    // description
    if (op.description_localizations) {
      o.description_localizations = loadLocalization(op.description_localizations);
    }

    // map the choices
    if ("choices" in op && op.choices) {
      const chs = [];

      for (const ch of op.choices) {
        const c: Record<string, any> = { ...ch };

        if (ch.name_localizations) {
          c.name_localizations = loadLocalization(ch.name_localizations);
        }

        chs.push(c);
      }

      // override the choices
      o.choices = chs;
    }

    // Recursively map the options, if it exists
    if ("options" in op && op.options) o.options = parseOptions(op.options);

    opt.push(o);
  }
  return opt;
}
