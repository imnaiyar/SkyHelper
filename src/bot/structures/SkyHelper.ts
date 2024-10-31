import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  PermissionFlagsBits,
  Routes,
  Options,
  type OAuth2Scopes,
  type TextChannel,
  type Webhook,
  type ApplicationCommand,
} from "discord.js";
import type { Button, ContextMenuCommand, Command } from "#structures";
import { HttpException, HttpStatus } from "@nestjs/common";
import { getUserID, type UserSession } from "#api/utils/discord";
import config from "#bot/config";
import { UpdateEvent, UpdateTS, recursiveReadDir } from "skyhelper-utils";
import { logger as Logger } from "#handlers";
import path from "node:path";
import chalk from "chalk";
import * as schemas from "#bot/database/index";
import { table } from "table";
import { pathToFileURL } from "node:url";
import { Flags, spiritsData } from "#libs";
import "./Extenders.js";
import { CustomLogger } from "#bot/handlers/logger";
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
      sweepers: Options.DefaultSweeperSettings,
    });
  }

  /**
   * Load all events from the specified directory
   * @param directory
   */
  public async loadEvents(directory: string): Promise<void> {
    console.log(chalk.blueBright("<---------------------- Loading Events ------------------------->"));
    let success = 0;
    let failed = 0;
    const clientEvents: unknown[][] = [];
    const files = recursiveReadDir(directory);

    for (const filePath of files) {
      const file = path.basename(filePath);
      try {
        const ext = process.isBun ? ".ts" : ".js";
        const eventName = path.basename(file, ext);
        const { default: event } = await import(pathToFileURL(filePath).href);

        this.on(eventName, event.bind(null, this));
        clientEvents.push([file, "✓"]);
        success += 1;
      } catch (ex) {
        failed += 1;
        Logger.error(`loadEvent - ${file}`, ex);
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

    Logger.custom(`Loaded ${success + failed} events. Success (${success}) Failed (${failed})`, "EVENTS");
  }

  /**
   * Load slash command to client on startup
   * @param dir The command directory
   * TODO: Add validation for commands
   */
  public async loadCommands(dir: string): Promise<void> {
    console.log(chalk.blueBright("\n\n<-------------------- Loading Commands ------------------------>\n"));
    let added = 0;
    let failed = 0;
    const files = recursiveReadDir(dir, ["sub"]);
    for (const filePath of files) {
      const file = path.basename(filePath);
      try {
        const { default: command } = (await import(pathToFileURL(filePath).href)) as {
          default: Command;
        };
        if (typeof command !== "object") continue;
        if (this.commands.has(command.name)) throw new Error("The command already exists");
        // const vld = cmdValidation(command, file);
        // if (!vld) return;
        this.commands.set(command.name, command);
        this.logger.custom(`Loaded ${command.name}`, "COMMANDS");
        added++;
      } catch (err) {
        failed++;
        Logger.error(`loadCommands - ${file}`, err);
      }
    }

    this.logger.custom(`Loaded ${added} Commands. Failed ${failed}`, "COMMANDS");
  }

  /**
   * Load context menu commands to client on startup
   * @param dir The command directory
   * TODO: Add validation for commands
   */
  public async loadContextCmd(dir: string): Promise<void> {
    console.log(chalk.blueBright("\n\n<---------------------- Loading Contexts ----------------------->\n"));
    let added = 0;
    let failed = 0;
    const files = recursiveReadDir(dir, ["sub"]);
    for (const filePath of files) {
      const file = path.basename(filePath);
      try {
        const { default: command } = (await import(pathToFileURL(filePath).href)) as {
          default: ContextMenuCommand<"MessageContext" | "UserContext">;
        };
        if (typeof command !== "object") continue;
        if (this.contexts.has(command.name + command.data.type.toString())) throw new Error("The command already exists");
        // const vld = cmdValidation(command, file);
        // if (!vld) return;
        this.contexts.set(command.name + command.data.type.toString(), command);
        this.logger.custom(`Loaded ${command.name}`, "CONTEXTS");
        added++;
      } catch (err) {
        failed++;
        Logger.error(`loaContextCmds - ${file}`, err);
      }
    }

    this.logger.custom(`Loaded ${added} Context Menu Commands. Failed ${failed}`, "CONTEXTS");
  }

  /**
   * Load buttons to client on startup
   * @param dir The butoons directory
   */
  public async loadButtons(dir: string): Promise<void> {
    console.log(chalk.blueBright("\n\n<---------------------- Loading Buttons ----------------------->\n"));
    let added = 0;
    let failed = 0;
    const files = recursiveReadDir(dir, ["sub"]);
    for (const filePath of files) {
      const file = path.basename(filePath);

      try {
        const { default: button } = (await import(pathToFileURL(filePath).href)) as {
          default: Button;
        };
        if (typeof button !== "object") continue;
        if (this.buttons.has(button.data.name)) throw new Error("The command already exists");
        this.buttons.set(button.data.name, button);
        this.logger.custom(`Loaded ${button.data.name}`, "BUTTON");
        added++;
      } catch (ex) {
        failed += 1;
        Logger.error(`${file}`, ex);
      }
    }
    this.logger.custom(`Loaded ${added} buttons. Failed ${failed}`, "BUTTONS");
  }

  /**
   * Register Slash Commands
   */
  public async registerCommands(): Promise<void> {
    const toRegister:
      | Pick<Command, "name" | "description" | "slash" | "userPermissions">
      | ContextMenuCommand<"MessageContext" | "UserContext">["data"][] = [];
    this.commands
      .filter((cmd) => !cmd.skipDeploy && "interactionRun" in cmd && !cmd.slash?.guilds)
      .map((cmd) => ({
        name: cmd.name,
        description: cmd.description,
        type: 1,
        ...(cmd.userPermissions && {
          default_member_permissions: cmd.userPermissions
            .reduce(
              (accumulator: bigint, permission) =>
                accumulator | PermissionFlagsBits[permission as unknown as keyof typeof PermissionFlagsBits],
              BigInt(0),
            )
            .toString(),
        }),
        ...cmd.slash,
      }))
      .forEach((s) => toRegister.push(s));

    this.contexts
      .filter((cmd) => !cmd.data.guilds)
      .map((cmd) => ({
        name: cmd.name,
        ...(cmd.userPermissions && {
          default_member_permissions: cmd.userPermissions
            .reduce(
              (accumulator: bigint, permission) =>
                accumulator | PermissionFlagsBits[permission as unknown as keyof typeof PermissionFlagsBits],
              BigInt(0),
            )
            .toString(),
        }),
        ...cmd.data,
      }))
      .forEach((s) => toRegister.push(s));
    await this.rest.put(Routes.applicationCommands(this.user.id), {
      body: toRegister,
    });

    this.logger.success("Successfully registered interactions");

    // Attempt to register any guild commands
    const guilCommandsSlash = this.commands.filter((cmd) => !cmd.skipDeploy && "interactionRun" in cmd && cmd.slash?.guilds);
    const guilCommandsContext = this.contexts.filter((cmd) => cmd.data.guilds);
    const guildCommands = [...guilCommandsSlash.values(), ...guilCommandsContext.values()];
    if (!guildCommands.length) return;
    console.log(chalk.blueBright("\n\n<------------ Attempting to register guild commands ----------->\n"));
    await Promise.all(
      guildCommands.map(async (cmd) => {
        const guilds = "description" in cmd ? cmd.slash?.guilds! : cmd.data.guilds!;
        for (const guild of guilds) {
          await this.rest.post(Routes.applicationGuildCommands(this.user.id, guild), {
            body: {
              name: cmd.name,
              ...("description" in cmd ? { description: cmd.description } : {}),
              ...("type" in cmd ? { type: cmd.type } : { type: 1 }),
              ...(cmd.userPermissions && {
                default_member_permissions: cmd.userPermissions
                  .reduce(
                    (accumulator: bigint, permission) =>
                      accumulator | PermissionFlagsBits[permission as unknown as keyof typeof PermissionFlagsBits],
                    BigInt(0),
                  )
                  .toString(),
              }),
              ...("slash" in cmd ? cmd.slash : {}),
            },
          });
          this.logger.custom(`Successfully registered "${cmd.name} "in ${guild}`, "GUILD COMMANDS");
        }
      }),
    );
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
