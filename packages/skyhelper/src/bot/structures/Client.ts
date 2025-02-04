import { Collection } from "@discordjs/collection";
import config from "@/config";
import {
  Client,
  InteractionType,
  type APIApplicationCommand,
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
import spiritsData from "@skyhelperbot/constants/spirits-datas";
import { HttpException, HttpStatus } from "@nestjs/common";
import { getUserID, type UserSession } from "@/api/utils/discord";
import { addBreadcrumb, getCurrentScope } from "@sentry/node";

export class SkyHelper extends Client {
  /** Set of unavailable guilds recieved when client first became ready */
  public unavailableGuilds: Set<string> = new Set();

  public ready: boolean = false;
  /** Whether client is waiting to recieve all guilds */
  public waitingForGuilds = false;

  /** Collection of guilds the bot is in */
  public guilds: Collection<string, GatewayGuildCreateDispatchData & { clientMember: APIGuildMember }> = new Collection();

  // @ts-expect-error this is set when client becomes ready.
  // So ideally should always be present as it is not accessed outside of events
  public user: APIUser;

  public schemas = schemas;

  /** Collection of channels available to the client */
  public channels: Collection<string, APIChannel> = new Collection();

  public commands: Collection<string, Command> = new Collection();

  public contexts: Collection<string, ContextMenuCommand<"MessageContext" | "UserContext">> = new Collection();

  public buttons: Collection<string, Button> = new Collection();

  public utils = Utils;

  /** Bot's config */
  public config = config;

  public spiritsData = spiritsData;

  public readTimestamp = 0;

  public ping = -1;

  /** Permissions util */
  public permUtils = (perms: PermissionsResolvable) => new PermissionsUtil(perms);

  /** Collection of command cooldowns */
  public cooldowns = new Collection<string, Collection<string, number>>();

  public logger = logger;

  public applicationCommands: Collection<string, APIApplicationCommand> = new Collection();

  public emojisMap = new Collection<
    string,
    {
      [key: string]: string;
    }
  >();

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
        if (messages) resolve(messages);
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

  /**
   * For Dashboard, validate user perms
   * @param user
   * @param guildID
   */
  public async checkPermissions(user: UserSession, guildID: string) {
    const guild = this.guilds.get(guildID);
    if (!guild) throw new HttpException("Guild Not found", HttpStatus.NOT_FOUND);

    const userID = await getUserID(user.access_token);
    const member = await this.api.guilds.getMember(guildID, userID);
    getCurrentScope().setUser({ id: userID, username: member.user.username });
    addBreadcrumb({
      category: "user",
      message: "Checking user permissions",
      data: { userID, username: member.user.username, guildID, guildName: guild.name },
      level: "info",
    });
    const memberPerms = PermissionsUtil.permissionsFor(member, guild);
    if (!memberPerms.has("ManageGuild") && guild.owner_id !== member.user.id) {
      throw new HttpException("Missing permissions", HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * For Dashboard, validate dashboard admin
   * @param user
   */
  public async checkAdmin(user: UserSession) {
    const userID = await getUserID(user.access_token);
    const u = await this.api.users.get(userID);
    addBreadcrumb({
      category: "user",
      message: "Checking if user is admin",
      data: { userID, username: u.username },
      level: "info",
    });

    if (!config.DASHBOARD.ADMINS.includes(u.id)) {
      throw new HttpException("Missing access", HttpStatus.UNAUTHORIZED);
    }
  }
}
