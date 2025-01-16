import { Collection, type LocalizationMap } from "discord.js";
import { recursiveReadDir } from "skyhelper-utils";
import path from "node:path";
import { pathToFileURL } from "node:url";
import logger, { CustomLogger } from "../handlers/logger.js";
import type { SkyHelper, Button, ContextMenuCommand, Command } from "#structures";
import { table } from "table";

// import i18next initialization file to ensure it's initialized before calling the below function
import "../i18n.js";
import type { LangKeys } from "../i18n.js";
import { t } from "i18next";
import { supportedLang } from "../libs/constants/supportedLang.js";
const baseDir = process.env.NODE_ENV === "development" ? "src/" : "dist/";
/**
 * Loads all the commands
 * @returns Collection of commands keyed by it's name
 */
export async function loadCommands() {
  const commands = new Collection<string, Command>();
  let added = 0;
  let failed = 0;
  const files = recursiveReadDir(baseDir + "bot/commands/inputCommands", ["sub"]);
  for (const filePath of files) {
    const file = path.basename(filePath);
    try {
      const { default: command } = (await import(pathToFileURL(filePath).href)) as {
        default: Command;
      };
      if (typeof command !== "object") continue;
      if (commands.has(command.name)) throw new Error("The command already exists");
      // const vld = cmdValidation(command, file);
      // if (!vld) return;
      commands.set(command.name, command);
      logger.custom(`Loaded ${command.name}`, "COMMANDS");
      added++;
    } catch (err) {
      failed++;
      logger.error(`loadCommands - ${file}`, err);
    }
  }
  logger.custom(`Loaded ${added} Commands. Failed ${failed}`, "COMMANDS");
  return commands;
}

/**
 * Loads all context menu commands
 * @returns A collection of context menu commands keyed by it's name
 */
export async function loadContextCmd() {
  const contexts = new Collection<string, ContextMenuCommand<"MessageContext" | "UserContext">>();
  let added = 0;
  let failed = 0;
  const files = recursiveReadDir(baseDir + "bot/commands/contexts", ["sub"]);
  for (const filePath of files) {
    const file = path.basename(filePath);
    try {
      const { default: command } = (await import(pathToFileURL(filePath).href)) as {
        default: ContextMenuCommand<"MessageContext" | "UserContext">;
      };
      if (typeof command !== "object") continue;
      if (contexts.has(command.name + command.data.type.toString())) throw new Error("The command already exists");
      // const vld = cmdValidation(command, file);
      // if (!vld) return;
      contexts.set(command.name + command.data.type.toString(), command);
      logger.custom(`Loaded ${command.name}`, "CONTEXTS");
      added++;
    } catch (err) {
      failed++;
      logger.error(`loaContextCmds - ${file}`, err);
    }
  }

  logger.custom(`Loaded ${added} Context Menu Commands. Failed ${failed}`, "CONTEXTS");
  return contexts;
}

/**
 * Loads all the buttons
 * @returns A collection of buttons keyed by it's custom ID
 */
export async function loadButtons() {
  const buttons = new Collection<string, Button>();
  let added = 0;
  let failed = 0;
  const files = recursiveReadDir(baseDir + "bot/buttons", ["sub"]);
  for (const filePath of files) {
    const file = path.basename(filePath);

    try {
      const { default: button } = (await import(pathToFileURL(filePath).href)) as {
        default: Button;
      };
      if (typeof button !== "object") continue;
      if (buttons.has(button.data.name)) throw new Error("The command already exists");
      buttons.set(button.data.name, button);
      logger.custom(`Loaded ${button.data.name}`, "BUTTON");
      added++;
    } catch (ex) {
      failed += 1;
      logger.error(`${file}`, ex);
    }
  }
  logger.custom(`Loaded ${added} buttons. Failed ${failed}`, "BUTTONS");
  return buttons;
}

/**
 * Loads all the event modules
 *
 * @param client Bot's client
 */
export async function loadEvents(client: SkyHelper) {
  let success = 0;
  let failed = 0;
  const clientEvents: unknown[][] = [];
  const files = recursiveReadDir(baseDir + "bot/events");

  for (const filePath of files) {
    const file = path.basename(filePath);
    try {
      const eventName = path.basename(file, process.env.NODE_ENV === "development" ? ".ts" : ".js");
      const { default: event } = await import(pathToFileURL(filePath).href);

      client.on(eventName, event.bind(null, client));
      clientEvents.push([file, "✓"]);
      success += 1;
    } catch (ex) {
      failed += 1;
      logger.error(`loadEvent - ${file}`, ex);
    }
  }

  CustomLogger.log(
    { hideLevel: true, timestamp: false },
    `\n${table(clientEvents, {
      header: {
        alignment: "center",
        content: "Client Events",
      },
      singleLine: true,
      columns: [{ width: 25 }, { width: 5, alignment: "center" }],
    })}`,
  );

  logger.custom(`Loaded ${success + failed} events. Success (${success}) Failed (${failed})`, "EVENTS");
}

/**
 * Get API compatible localization data for all the available (and allowed) languages
 * @param key translation keys
 * @returns localization data
 */
export function loadLocalization(key: LangKeys): LocalizationMap {
  const isName = key.split(".").pop() === "name"; // If the localization is for command/options name
  const data: LocalizationMap = {};
  for (const { value } of supportedLang) {
    const translation = t(key, { lng: value });
    data[value] = isName
      ? translation
          .toLocaleLowerCase(value)
          .replace(/ /g, "-") /* Attempt to strip spaces, and lowercase name for command/options names */
      : translation;
  }
  return data;
}
