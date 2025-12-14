import { Collection } from "@discordjs/collection";
import config from "@/config";
import {
  Client,
  InteractionType,
  type APIApplicationCommand,
  type APIApplicationEmoji,
  type APIChannel,
  type APIGuildMember,
  type APIMessage,
  type APIModalSubmitInteraction,
  type APIUser,
  type GatewayGuildCreateDispatchData,
} from "@discordjs/core";
import type { Command } from "./Command.js";
import chalk from "chalk";
import { PermissionsUtil, type PermissionsResolvable } from "@/utils/classes/PermissionUtils";
import { loadButtons, loadCommands, loadContextCmd, loadEvents } from "@/utils/loaders";
import type { ContextMenuCommand } from "./ContextMenuCommand.js";
import type { Button } from "./Button.js";
import * as schemas from "@/schemas/index";
import Utils from "@/utils/classes/Utils";
import logger from "@/handlers/logger";
import type { ComponentInteractionMap, MessageComponentType } from "@/@types/interactions";
import {
  InteractionCollector,
  MessageCollector,
  type CollectorOptions,
  type InteractionCollectorOptions,
  type MessageCollectorOptions,
} from "@/utils/classes/Collector";
import type { CustomId } from "@/utils/customId-store";

export class SkyHelper extends Client {
  /** Set of unavailable guilds recieved when client first became ready */
  public unavailableGuilds = new Set<string>();

  public ready = false;
  /** Whether client is waiting to recieve all guilds */
  public waitingForGuilds = false;

  /** Collection of guilds the bot is in */
  public guilds = new Collection<string, GatewayGuildCreateDispatchData & { clientMember: APIGuildMember }>();

  // @ts-expect-error this is set when client becomes ready.
  // So ideally should always be present as it is not accessed outside of events
  public user: APIUser;

  public schemas = schemas;

  /** Collection of channels available to the client */
  public channels = new Collection<string, APIChannel>();

  public commands = new Collection<string, Command>();

  public contexts = new Collection<string, ContextMenuCommand<"MessageContext" | "UserContext">>();

  public buttons = new Collection<string, Button<CustomId>>();

  public utils = Utils;

  /** Bot's config */
  public config = config;

  public readTimestamp = 0;

  public ping = -1;

  /** Permissions util */
  public permUtils = (perms: PermissionsResolvable) => new PermissionsUtil(perms);

  /** Collection of command cooldowns */
  public cooldowns = new Collection<string, Collection<string, number>>();

  public logger = logger;

  public applicationCommands = new Collection<string, APIApplicationCommand>();

  public applicationEmojis = new Collection<string, APIApplicationEmoji>();

  public timezone = "America/Los_Angeles";

  /** Map of currently active Quiz game data */
  public gameData = new Collection<string, any>();

  public componentCollector<TComponent extends MessageComponentType>(
    options: Omit<InteractionCollectorOptions<TComponent>, "interactionType"> & { componentType?: TComponent },
  ) {
    return new InteractionCollector<TComponent>(this, options);
  }

  public awaitComponent<Type extends MessageComponentType>(
    options: Omit<InteractionCollectorOptions<Type>, "interactionType" | "max"> & { componentType?: Type },
  ) {
    return new Promise<ComponentInteractionMap[Type]>((resolve, reject) => {
      const collector = new InteractionCollector<Type>(this, { ...options, max: 1 });
      collector.once("end", (collected, reason) => {
        const interaction = collected[0];
        if (interaction) resolve(interaction);
        else reject(new Error(reason));
      });
    });
  }

  public awaitModal(options: Omit<CollectorOptions<APIModalSubmitInteraction>, "interactionType" | "componentType" | "max">) {
    const collector = new InteractionCollector(this, { ...options, max: 1, interactionType: InteractionType.ModalSubmit });
    return new Promise<APIModalSubmitInteraction>((resolve, reject) => {
      collector.once("end", (collected, reason) => {
        const interaction = collected[0];
        if (interaction) resolve(interaction);
        else reject(new Error(reason));
      });
    });
  }

  public awaitMessages(options: MessageCollectorOptions) {
    const collector = new MessageCollector(this, options);
    return new Promise<APIMessage[]>((resolve, reject) => {
      collector.once("end", (collected, reason) => {
        const messages = collected;
        if (messages.length) resolve(messages);
        else reject(new Error(reason));
      });
    });
  }

  /**
   * Loads all the modules
   */
  public async loadModules() {
    console.log(chalk.blueBright("<---------------------- Loading Events ------------------------->"));
    await loadEvents(this);
    console.log(chalk.blueBright("\n\n<-------------------- Loading Commands ------------------------>\n"));
    this.commands = await loadCommands();
    console.log(chalk.blueBright("\n\n<---------------------- Loading Contexts ----------------------->\n"));
    this.contexts = await loadContextCmd();
    console.log(chalk.blueBright("\n\n<---------------------- Loading Buttons ----------------------->\n"));
    this.buttons = await loadButtons();
  }
}
