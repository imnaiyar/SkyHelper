import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  PermissionFlagsBits,
  Routes,
  OAuth2Scopes,
  TextChannel,
  Webhook,
  ApplicationCommand,
} from "discord.js";
import moment from "moment-timezone";
import { SlashCommand, Button, PrefixCommand, ContextMenuCommand } from "#structures";
import config from "#src/config";
import { recursiveReadDir } from "skyhelper-utils";
import { logger as Logger } from "#handlers";
import path from "node:path";
import chalk from "chalk";
import { table } from "table";
import { pathToFileURL } from "node:url";
import spiritsData from "#libs/datas/spiritsData";
interface SkyEvent {
  eventActive: boolean;
  eventName: string;
  eventStarts: moment.Moment;
  eventEnds: moment.Moment;
  eventDuration: string;
}
interface TS {
  name: string;
  visitDate: string;
  departDate: string;
  value: string;
  spiritImage: string;
  index: string;
}

/** The bot's client */
export class SkyHelper extends Client<true> {
  /** Configurations for the bot */
  public config: typeof config;

  /** Collection of Slash Commands */
  public commands: Collection<string, SlashCommand>;

  /** Collection of Prefix Commands */
  public prefix: Collection<string, PrefixCommand>;

  /** Collection of Context Menu Commands */
  public contexts: Collection<string, ContextMenuCommand>;

  /** Collection of Buttons */
  public buttons: Collection<string, Button>;

  /** Collection of command cooldowns */
  public cooldowns: Collection<string, Collection<string, number>>;

  /** Default timezone used thorughout the client for time-based calculations */
  public timezone: string;

  /** A map of events occuring in Sky: COTL */
  public skyEvents: Map<string, SkyEvent>;

  /** Collection of utility classes */
  public classes: Collection<string, any>;

  /** Current Traveling Spirit Data */
  public ts: TS;

  /** Custom logger */
  public logger: typeof Logger;

  /** Map of currently active Quiz game data */
  public gameData: Map<string, any>;

  /** Map of emojis */
  public emojisMap: Map<string, any>;

  /** All the Sky: SCOTL spirits data */
  public spiritsData: typeof spiritsData;
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildMessageReactions,
      ],
      partials: [Partials.Channel, Partials.GuildMember, Partials.Message],
      allowedMentions: {
        repliedUser: false,
      },
    });
    this.config = config;
    this.commands = new Collection();
    this.prefix = new Collection();
    this.contexts = new Collection();
    this.buttons = new Collection();
    this.logger = Logger;
    this.cooldowns = new Collection();
    this.timezone = "America/Los_Angeles";
    this.skyEvents = new Map();
    this.skyEvents.set("events", {
      eventActive: false,
      eventName: "Days of Bloom",
      eventStarts: moment.tz("2024-03-12", this.timezone),
      eventEnds: moment.tz("2024-03-14", this.timezone),
      eventDuration: "12 days",
    });
    this.classes = new Collection();
    this.ts = {
      name: "Hairtousle Teen",
      visitDate: "kujwdhcbdc",
      departDate: "khdbcs",
      spiritImage: "djncd",
      value: "dfjn",
      index: "dbjcm",
    };
    this.gameData = new Map();
    this.emojisMap = new Map();
    this.spiritsData = spiritsData;
  }

  /**
   * Load all events from the specified directory
   * @param directory
   */
  public async loadEvents(directory: string): Promise<void> {
    this.logger.log(chalk.blueBright("<------------ Loading Events --------------->"));
    let success = 0;
    let failed = 0;
    const clientEvents: unknown[][] = [];
    const files = recursiveReadDir(directory);

    for (const filePath of files) {
      const file = path.basename(filePath);
      try {
        const eventName = path.basename(file, ".js");
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
    );

    Logger.log(`Loaded ${success + failed} events. Success (${success}) Failed (${failed})`);
  }

  /**
   * Load slash command to client on startup
   * @param dir The command directory
   * TODO: Add validation for commands
   */
  public async loadSlashCmd(dir: string): Promise<void> {
    this.logger.log(chalk.blueBright("<------------ Loading Slash ---------------->"));
    let added = 0;
    let failed = 0;
    const files = recursiveReadDir(dir, ["sub"]);
    for (const filePath of files) {
      const file = path.basename(filePath);
      try {
        const { default: command } = await import(pathToFileURL(filePath).href);
        // const vld = cmdValidation(command, file);
        // if (!vld) return;
        this.commands.set(command.data.name, command);
        this.logger.log(`Loaded ${command.data.name}`);
        added++;
      } catch (err) {
        failed++;
        Logger.error(`loadSlashCmds - ${file}`, err);
      }
    }

    this.logger.log(`Loaded ${added} Slash Commands. Failed ${failed}`);
  }

  /**
   * Load context menu commands to client on startup
   * @param dir The command directory
   * TODO: Add validation for commands
   */
  public async loadContextCmd(dir: string): Promise<void> {
    this.logger.log(chalk.blueBright("<------------ Loading Contexts ---------------->"));
    let added = 0;
    let failed = 0;
    const files = recursiveReadDir(dir, ["sub"]);
    for (const filePath of files) {
      const file = path.basename(filePath);
      try {
        const { default: command } = await import(pathToFileURL(filePath).href);
        // const vld = cmdValidation(command, file);
        // if (!vld) return;
        this.contexts.set(command.data.name, command);
        this.logger.log(`Loaded ${command.data.name}`);
        added++;
      } catch (err) {
        failed++;
        Logger.error(`loaContextCmds - ${file}`, err);
      }
    }

    this.logger.log(`Loaded ${added} Context Menu Commands. Failed ${failed}`);
  }

  /**
   * Load buttons to client on startup
   * @param dir The butoons directory
   */
  public async loadButtons(dir: string): Promise<void> {
    this.logger.log(chalk.blueBright("<------------ Loading Buttons -------------->"));
    let added = 0;
    let failed = 0;
    const files = recursiveReadDir(dir);
    for (const filePath of files) {
      const file = path.basename(filePath);

      try {
        const { default: button } = await import(pathToFileURL(filePath).href);
        if (typeof button !== "object") return;
        this.buttons.set(button.name, button);
        this.logger.log(`Loaded ${button.name}`);
        added++;
      } catch (ex) {
        failed += 1;
        Logger.error(`${file}`, ex);
      }
    }
    this.logger.log(`Loaded ${added} buttons. Failed ${failed}`);
  }

  /**
   * Load prefix command on startup
   * @param dir
   */
  public async loadPrefix(dir: string): Promise<void> {
    this.logger.log(chalk.blueBright("<------------ Loading Prefix --------------->"));
    let added = 0;
    let failed = 0;
    const files = recursiveReadDir(dir);
    for (const filePath of files) {
      const file = path.basename(filePath);
      try {
        const { default: command } = await import(pathToFileURL(filePath).href);

        this.prefix.set(command.data.name, command);
        command.data?.aliases?.forEach((al: string) => this.prefix.set(al, command));
        this.logger.log(`Loaded ${command.data.name}`);
        added++;
      } catch (err) {
        failed++;
        Logger.error(`${file}`, err);
      }
    }

    this.logger.log(`Loaded ${added} Prefix Commands. Failed ${failed}`);
  }

  /**
   * Register Slash Commands
   */
  public async registerCommands(): Promise<void> {
    const toRegister: SlashCommand["data"] | ContextMenuCommand["data"][] = [];
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
