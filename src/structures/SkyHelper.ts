import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  PermissionFlagsBits,
  Routes,
  type OAuth2Scopes,
  type TextChannel,
  type Webhook,
  type ApplicationCommand,
} from "discord.js";
import type { SlashCommand, Button, PrefixCommand, ContextMenuCommand } from "#structures";
import config from "#src/config";
import { recursiveReadDir } from "skyhelper-utils";
import { logger as Logger } from "#handlers";
import path from "node:path";
import chalk from "chalk";
import * as schemas from "#src/database/index";
import { table } from "table";
import { pathToFileURL } from "node:url";
import { spiritsData } from "#libs";
/** The bot's client */
export class SkyHelper extends Client<true> {
  /** Configurations for the bot */
  public config = config;

  /** Collection of Slash Commands */
  public commands = new Collection<string, SlashCommand>();

  /** Collection of Prefix Commands */
  public prefix = new Collection<string, PrefixCommand>();

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
  public classes = new Collection<string, any>();

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
        const ext = process.argv[0].includes("bun") ? ".ts" : ".js"
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

    this.logger.log(
      `\n${table(clientEvents, {
        header: {
          alignment: "center",
          content: "Client Events",
        },
        singleLine: true,
        columns: [{ width: 25 }, { width: 5, alignment: "center" }],
      })}`,
      "EVENTS",
    );

    Logger.log(`Loaded ${success + failed} events. Success (${success}) Failed (${failed})`, "EVENTS");
  }

  /**
   * Load slash command to client on startup
   * @param dir The command directory
   * TODO: Add validation for commands
   */
  public async loadSlashCmd(dir: string): Promise<void> {
    console.log(chalk.blueBright("\n\n<---------------------- Loading Slash -------------------------->\n"));
    let added = 0;
    let failed = 0;
    const files = recursiveReadDir(dir, ["sub"]);
    for (const filePath of files) {
      const file = path.basename(filePath);
      try {
        const { default: command } = (await import(pathToFileURL(filePath).href)) as {
          default: SlashCommand;
        };
        if (typeof command !== "object") continue;
        if (this.commands.has(command.data.name)) throw new Error("The command already exists");
        // const vld = cmdValidation(command, file);
        // if (!vld) return;
        this.commands.set(command.data.name, command);
        this.logger.log(`Loaded ${command.data.name}`, "SLASH");
        added++;
      } catch (err) {
        failed++;
        Logger.error(`loadSlashCmds - ${file}`, err);
      }
    }

    this.logger.log(`Loaded ${added} Slash Commands. Failed ${failed}`, "SLASH");
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
        if (this.contexts.has(command.data.name + command.data.type.toString())) throw new Error("The command already exists");
        // const vld = cmdValidation(command, file);
        // if (!vld) return;
        this.contexts.set(command.data.name + command.data.type.toString(), command);
        this.logger.log(`Loaded ${command.data.name}`, "CONTEXTS");
        added++;
      } catch (err) {
        failed++;
        Logger.error(`loaContextCmds - ${file}`, err);
      }
    }

    this.logger.log(`Loaded ${added} Context Menu Commands. Failed ${failed}`, "CONTEXTS");
  }

  /**
   * Load buttons to client on startup
   * @param dir The butoons directory
   */
  public async loadButtons(dir: string): Promise<void> {
    console.log(chalk.blueBright("\n\n<---------------------- Loading Buttons ----------------------->\n"));
    let added = 0;
    let failed = 0;
    const files = recursiveReadDir(dir);
    for (const filePath of files) {
      const file = path.basename(filePath);

      try {
        const { default: button } = (await import(pathToFileURL(filePath).href)) as {
          default: Button;
        };
        if (typeof button !== "object") continue;
        if (this.buttons.has(button.data.name)) throw new Error("The command already exists");
        this.buttons.set(button.data.name, button);
        this.logger.log(`Loaded ${button.data.name}`, "BUTTON");
        added++;
      } catch (ex) {
        failed += 1;
        Logger.error(`${file}`, ex);
      }
    }
    this.logger.log(`Loaded ${added} buttons. Failed ${failed}`, "BUTTONS");
  }

  /**
   * Load prefix command on startup
   * @param dir
   */
  public async loadPrefix(dir: string): Promise<void> {
    console.log(chalk.blueBright("\n\n<---------------------- Loading Prefix ------------------------->\n"));
    let added = 0;
    let failed = 0;
    const files = recursiveReadDir(dir);
    for (const filePath of files) {
      const file = path.basename(filePath);
      try {
        const { default: command } = (await import(pathToFileURL(filePath).href)) as {
          default: PrefixCommand;
        };
        if (typeof command !== "object") continue;
        if (this.prefix.has(command.data.name)) throw new Error("The command already exists");
        this.prefix.set(command.data.name, command);
        command.data?.aliases?.forEach((al: string) => this.prefix.set(al, command));
        this.logger.log(`Loaded ${command.data.name}`, "PREFIX");
        added++;
      } catch (err) {
        failed++;
        Logger.error(`${file}`, err);
      }
    }

    this.logger.log(`Loaded ${added} Prefix Commands. Failed ${failed}`, "PREFIX");
  }

  /**
   * Register Slash Commands
   */
  public async registerCommands(): Promise<void> {
    const toRegister: SlashCommand["data"] | ContextMenuCommand<"MessageContext" | "UserContext">["data"][] = [];
    this.commands
      .map((cmd) => ({
        name: cmd.data.name,
        description: cmd.data.description,
        type: 1,
        options: cmd.data?.options,
        integration_types: cmd.data.integration_types,
        ...(cmd.data.userPermissions && {
          default_member_permissions: cmd.data.userPermissions
            .reduce(
              (accumulator: bigint, permission) =>
                accumulator | PermissionFlagsBits[permission as unknown as keyof typeof PermissionFlagsBits],
              BigInt(0),
            )
            .toString(),
        }),
        contexts: cmd.data.contexts,
      }))
      .forEach((s) => toRegister.push(s));

    this.contexts
      .map((cmd) => ({
        name: cmd.data.name,
        type: cmd.data.type,
        integration_types: cmd.data.integration_types,
        contexts: cmd.data.contexts,
        ...(cmd.data.userPermissions && {
          default_member_permissions: cmd.data.userPermissions
            .reduce(
              (accumulator: bigint, permission) =>
                accumulator | PermissionFlagsBits[permission as unknown as keyof typeof PermissionFlagsBits],
              BigInt(0),
            )
            .toString(),
        }),
      }))
      .forEach((s) => toRegister.push(s));
    await this.rest.put(Routes.applicationCommands(this.user.id), {
      body: toRegister,
    });

    this.logger.success("Successfully registered interactions");
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
}
