import type { If } from "../@types/utils.js";
import { Collection } from "@discordjs/collection";
import config from "../../config.js";
import {
  Client,
  type APIChannel,
  type APIGuild,
  type APIGuildMember,
  type APIUser,
  type GatewayGuildCreateDispatch,
  type GatewayGuildCreateDispatchData,
} from "@discordjs/core";
import type { Command } from "./Command.js";
import chalk from "chalk";
import { PermissionsUtil, type PermissionsResolvable } from "@/utils/PermissionUtils";
import { loadButtons, loadCommands, loadContextCmd, loadEvents } from "@/utils/loaders";
import type { ContextMenuCommand } from "./ContextMenuCommand.js";
import type { Button } from "./Button.js";
import * as schemas from "@/schemas/index";

export class SkyHelper extends Client {
  /** Set of unavailable guilds recieved when client first became ready */
  public unavailableGuilds: Set<string> = new Set();

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

  /** Bot's config */
  public config = config;

  /** Permissions util */
  public permUtils = (perms: PermissionsResolvable) => new PermissionsUtil(perms);

  /** Collection of command cooldowns */
  public cooldowns = new Collection<string, Collection<string, number>>();

  public getUserAvatar = (user: APIUser) =>
    user.avatar
      ? this.api.rest.cdn.avatar(user.id, user.avatar)
      : this.api.rest.cdn.defaultAvatar(Number((BigInt(user.id) >> 22n) % 5n));

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
