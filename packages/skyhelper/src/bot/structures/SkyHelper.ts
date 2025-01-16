import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  Options,
  type OAuth2Scopes,
  type TextChannel,
  type Webhook,
  type ApplicationCommand,
} from "discord.js";
import type { Button, ContextMenuCommand, Command } from "./index.js";
import { HttpException, HttpStatus } from "@nestjs/common";
import { getUserID, type UserSession } from "#api/utils/discord";
import config from "#bot/config";
import { UpdateEvent, UpdateTS } from "skyhelper-utils";
import { logger as Logger } from "#handlers";
import chalk from "chalk";
import * as schemas from "#bot/database/index";
import { Flags } from "#libs";
import spiritsData from "@skyhelperbot/constants/spirits-datas";
import "./Extenders.js";
import { loadButtons, loadCommands, loadContextCmd, loadEvents } from "#bot/utils/loaders";
export type ClassTypes = {
  UpdateTS: typeof UpdateTS;
  UpdateEvent: typeof UpdateEvent;
  Flags: typeof Flags;
};

/** The bot's client */
export class SkyHelper extends Client<true> {
  /** Configurations for the bot */
  public config = config;

  /** Collection of Slash Commands */
  public commands = new Collection<string, Command>();

  /** Collection of Context Menu Commands */
  public contexts = new Collection<string, ContextMenuCommand<"MessageContext" | "UserContext">>();

  /** Collection of Buttons */
  public buttons = new Collection<string, Button>();

  /** Collection of command cooldowns */
  public cooldowns = new Collection<string, Collection<string, number>>();

  /** Default timezone used thorughout the client for time-based calculations */
  public timezone = "America/Los_Angeles";

  /** get current event Data
   * @example
   * const data = await <Client>.getEvent()
   */
  public getEvent = schemas.getEvent;

  /** Collection of utility classes */

  public classes = new Collection<keyof ClassTypes, ClassTypes[keyof ClassTypes]>();

  /** Database schemas/fuctions */
  public database = schemas;

  /**
   * Current Traveling Spirit Data
   * @example
   * const data = await <Client>.getTS()
   */
  public getTS = schemas.getTS;
  /** Custom logger */
  public logger = Logger;

  /** Map of currently active Quiz game data */
  public gameData = new Collection<string, any>();

  /** Map of emojis */
  public emojisMap = new Collection<
    string,
    {
      [key: string]: string;
    }
  >();

  /** All the Sky: SCOTL spirits data */
  public spiritsData = spiritsData;
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
      ],
      partials: [Partials.Channel, Partials.GuildMember, Partials.Message],
      allowedMentions: {
        repliedUser: false,
      },
      makeCache: Options.cacheWithLimits({
        ...Options.DefaultMakeCacheSettings,
        MessageManager: 0,
        ReactionManager: 0,
        ReactionUserManager: 0,
        DMMessageManager: 0,
        GuildForumThreadManager: 0,
        GuildMessageManager: 0,
        GuildTextThreadManager: 0,
        GuildInviteManager: 0,
      }),
      sweepers: {
        ...Options.DefaultSweeperSettings,
        users: {
          interval: 36_00, // an hour
          filter: () => (user) => user.id !== user.client.user.id,
        },
        guildMembers: {
          interval: 36_00, // an hour
          filter: () => (member) => member.id !== member.client.user.id,
        },
      },
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
   * Get bot's invite
   */
  public getInvite(): string {
    return this.generateInvite({
      scopes: ["bot", "application.commands"] as unknown as OAuth2Scopes[],
      permissions: 412317243584n,
    });
  }

  /**
   * @param channel Channel where webhook is to be created
   * @param reason The reason for webhooks creation
   */
  public async createWebhook(channel: TextChannel, reason: string): Promise<Webhook> {
    const webhook = await channel.createWebhook({
      name: "SkyHelper",
      avatar: this.user.displayAvatarURL(),
      reason: reason ? reason : "SkyHelper Webhook",
    });
    return webhook;
  }

  /**
   * get commands from client application
   * @param value - command name or id
   */
  public async getCommand(value: string | number): Promise<ApplicationCommand> {
    if (!value) throw new Error('Command "name" or "id" must be passed as an argument');
    await this.application.commands.fetch();
    const command =
      typeof value === "string" && isNaN(value as unknown as number)
        ? this.application.commands.cache.find((cmd) => cmd.name === value.toLowerCase())
        : !isNaN(value as unknown as number)
          ? this.application.commands.cache.get(value.toString())
          : (() => {
              throw new Error("Provided Value Must Either be a String or a Number");
            })();
    if (!command) throw new Error("No matching command found");
    return command;
  }

  /**
   * For Dashboard, validate user perms
   * @param user
   * @param guildID
   */
  public async checkPermissions(user: UserSession, guildID: string) {
    const guild = this.guilds.cache.get(guildID);
    if (!guild) throw new HttpException("Guild Not found", HttpStatus.NOT_FOUND);

    const userID = await getUserID(user.access_token);
    const member = await guild?.members.fetch(userID).catch(() => null);

    if (!member?.permissions.has("ManageGuild") && guild.ownerId !== member?.id) {
      throw new HttpException("Missing permissions", HttpStatus.UNAUTHORIZED);
    }
  }
  /**
   * For Dashboard, validate dashboard admin
   * @param user
   */
  public async checkAdmin(user: UserSession) {
    const userID = await getUserID(user.access_token);
    const u = await this.users.fetch(userID);

    if (!config.DASHBOARD.ADMINS.includes(u.id)) {
      throw new HttpException("Missing access", HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Resolves an application command into a mention
   * @param command The command to mention
   * @param sub Subcoomand if it's subcommand mention
   * @returns The command mentions
   */
  public mentionCommand(command: ApplicationCommand, sub?: string) {
    if (sub) {
      const option = command.options.find((o) => o.type === 1 && o.name === sub);
      if (!option) throw new Error(`THe provided command doesn't have any subcommand option with the name ${sub}`);
    }
    return `</${command.name}${sub ? ` ${sub}` : ""}:${command.id}>`;
  }
}
