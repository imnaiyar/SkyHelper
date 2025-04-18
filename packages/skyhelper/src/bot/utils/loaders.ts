import "@/i18n";
import { t } from "i18next";
import { Collection } from "@discordjs/collection";
import { recursiveReadDir } from "@skyhelperbot/utils";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { SkyHelper, Event, Command, Button } from "@/structures";
import logger from "@/handlers/logger";
import type { ContextMenuCommand } from "@/structures/ContextMenuCommand";
import type { LocalizationMap } from "@discordjs/core";
import type { LangKeys } from "@/types/i18n";
import { supportedLang } from "@skyhelperbot/constants";
import { isProd } from "./constants.js";
const baseDir = (isProd ? "dist/" : "src/") + "bot/";

// #region commands
/**
 * Loads all the commands
 * @returns Collection of commands keyed by it's name
 */
export async function loadCommands() {
  const commands = new Collection<string, Command>();
  let added = 0;
  let failed = 0;
  for await (const [filename, command] of loadStructures<Command>("modules/inputCommands", ["sub"])) {
    try {
      if (typeof command !== "object") continue;
      if (commands.has(command.name)) throw new Error("The command already exists");
      // const vld = cmdValidation(command, file);
      // if (!vld) return;
      commands.set(command.name, command);
      logger.custom(`Loaded ${command.name}`, "COMMANDS");
      added++;
    } catch (err) {
      failed++;
      logger.error(`loadCommands - ${filename}`, err);
    }
  }

  logger.custom(`Loaded ${added} Commands. Failed ${failed}`, "COMMANDS");
  return commands;
}

// #region contexts
/**
 * Loads all context menu commands
 * @returns A collection of context menu commands keyed by it's name
 */
export async function loadContextCmd() {
  const contexts = new Collection<string, ContextMenuCommand<"MessageContext" | "UserContext">>();
  let added = 0;
  let failed = 0;

  for await (const [filename, command] of loadStructures<ContextMenuCommand<"MessageContext" | "UserContext">>(
    "modules/contexts",
    ["sub"],
  )) {
    try {
      if (typeof command !== "object") continue;
      if (contexts.has(command.name + command.data.type.toString())) throw new Error("The command already exists");
      // const vld = cmdValidation(command, file);
      // if (!vld) return;
      contexts.set(command.name + command.data.type.toString(), command);
      logger.custom(`Loaded ${command.name}`, "CONTEXTS");
      added++;
    } catch (err) {
      failed++;
      logger.error(`loaContextCmds - ${filename}`, err);
    }
  }

  logger.custom(`Loaded ${added} Context Menu Commands. Failed ${failed}`, "CONTEXTS");
  return contexts;
}

// #region buttons
/**
 * Loads all the buttons
 * @returns A collection of buttons keyed by it's custom ID
 */
export async function loadButtons() {
  const buttons = new Collection<string, Button>();
  let added = 0;
  let failed = 0;
  for await (const [filename, button] of loadStructures<Button>("modules/buttons", ["sub"])) {
    try {
      if (typeof button !== "object") continue;
      if (buttons.has(button.data.name)) throw new Error("The button already exists");
      buttons.set(button.data.name, button);
      logger.custom(`Loaded ${button.data.name}`, "Button");
      added++;
    } catch (err) {
      failed += 1;
      logger.error(`${filename}`, err);
    }
  }
  logger.custom(`Loaded ${added} buttons. Failed ${failed}`, "Buttons");
  return buttons;
}

// #region events
/**
 * Loads all the event modules
 *
 * @param client Bot's client
 */
export async function loadEvents(client: SkyHelper) {
  let success = 0;
  let failed = 0;

  for await (const [filename, event] of loadStructures<Event>("events")) {
    const eventName = filename.split(".").shift()!;
    try {
      if (typeof event !== "function") continue;

      client[eventName === "ready" ? "once" : "on"](eventName, event.bind(null, client));
      logger.custom(`Loaded ${eventName}`, "EVENTS");
      success++;
    } catch (err) {
      failed++;
      logger.error(`loadEvents - ${eventName}`, err);
    }
  }

  console.log(`Loaded ${success + failed} events. Success (${success}) Failed (${failed})`, "EVENTS");
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
      ? translation.toLocaleLowerCase(value).replace(/ /g, "-") // Attempt to strip spaces, and lowercase name for command/options names
      : translation;
  }
  return data;
}

/**
 * Async generator that yields the structures from the specified directory
 * @param filepath The directory to load the structures from
 * @param skipPaths Paths to skip
 * @returns Iterator of `[filename, structure]`
 */
async function* loadStructures<T>(
  filepath: "modules/buttons" | "modules/contexts" | "modules/inputCommands" | "events",
  skipPaths?: string[],
) {
  const files = recursiveReadDir(baseDir + filepath, skipPaths);
  for (const file of files) {
    const filename = path.basename(file);
    const { default: structure } = (await import(pathToFileURL(file).href)) as { default: T };
    yield [filename, structure] as const;
  }
}
