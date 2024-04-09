import { Client, GatewayIntentBits, Partials, Collection, PermissionFlagsBits, Routes } from 'discord.js';
import * as moment from 'moment-timezone';
import { type SlashCommand, type Button, type PrefixCommand } from '#structures';
import config from '#src/config';
import { recursiveReadDir } from 'skyhelper-utils';
import { logger as Logger } from '#handlers';
import * as path from 'node:path';
import * as chalk from 'chalk';
import { table } from 'table';
interface SkyEvent {
    eventActive: boolean,
    eventName: string,
    eventStarts: moment.Moment,
    eventEnds: moment.Moment,
    eventDuration: string
}
interface TS {
    name: string,
    visitDate: string,
    departDate: string,
    value: string,
    spiritImage: string,
    index: string
}
export class SkyHelper extends Client<true> {
    public config: typeof config;
    public commands: Collection<string, SlashCommand>;
    public prefix: Collection<string, PrefixCommand>;
    public buttons: Collection<string, Button>;
    public cooldowns: Collection<string, Collection<string, Date>>;
    public timezone: string;
    public skyEvents: Map<string, SkyEvent>;
    public classes: Collection<string, any>;
    public ts: TS;
    public logger: typeof Logger;
    public gameData: Map<string, any>;
    public emojisMap: Map<string, any>;
    public spiritsData: any;
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
            partials: [ Partials.Channel, Partials.GuildMember, Partials.Message],
        }),
        this.config = config;
        this.commands = new Collection();
        this.prefix = new Collection();
        this.buttons = new Collection();
        this.logger = Logger;
        this.cooldowns = new Collection();
        this.timezone = 'America/Los_Angeles';
        this.skyEvents = new Map();
        this.skyEvents.set('events', {
            eventActive: false,
            eventName: 'Days of Bloom',
            eventStarts: moment.tz('2024-03-12', this.timezone),
            eventEnds: moment.tz('2024-03-14', this.timezone),
            eventDuration: '12 days',
        });
        this.classes = new Collection();
        this.ts = {
            name: 'Hairtousle Teen',
            visitDate: 'kujwdhcbdc',
            departDate: 'khdbcs',
            spiritImage: 'djncd',
            value: 'dfjn',
            index: 'dbjcm',
        };
        this.gameData = new Map();
        this.emojisMap = new Map();
        this.spiritsData = null;
    }

  /**
   * Load all events from the specified directory
   * @param directory
   */
  loadEvents(directory: string): void {
    this.logger.log(chalk.blueBright("<------------ Loading Events --------------->"));
    let success = 0;
    let failed = 0;
    const clientEvents: unknown[][] = [];
    this.removeAllListeners();
    recursiveReadDir(directory).forEach((filePath) => {
      const file = path.basename(filePath);
      try {
        const eventName = path.basename(file, ".js");
        delete require.cache[require.resolve(filePath)];
        const event = require(filePath);

        this.on(eventName, event.bind(null, this));
        clientEvents.push([file, "✓"]);
        success += 1;
      } catch (ex) {
        failed += 1;
        Logger.error(`loadEvent - ${file}`, ex);
      }
    });

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
   * @param dir
   */
  loadSlashCmd(dir: string): void {
    this.logger.log(chalk.blueBright("<------------ Loading Slash ---------------->"));
    let added = 0;
    let failed = 0;
    recursiveReadDir(dir, ['prefix', 'sub']).forEach(async (filePath): Promise<void> => {
      const file = path.basename(filePath);
      try {
        delete require.cache[require.resolve(filePath)];
        const { default: command } = await import(filePath);
        // const vld = cmdValidation(command, file);
        // if (!vld) return;
        this.commands.set(command.data.name, command);
        this.logger.log(`Loaded ${command.data.name}`);
        added++;
      } catch (err) {
        failed++;
        Logger.error(`loadSlashCmds - ${file}`, err);
      }
    });
    this.logger.log(`Loaded ${added} Slash Commands. Failed ${failed}`);
  }

  /**
   * Load buttons to client on startup
   * @param dir
   */
  loadButtons(dir: string): void {
    this.logger.log(chalk.blueBright("<------------ Loading Buttons -------------->"));
    let added = 0;
    let failed = 0;
    recursiveReadDir(dir).forEach(async (filePath): Promise<void> => {
      const file = path.basename(filePath);

      try {
        delete require.cache[require.resolve(filePath)];
        const { default: button } = await import(filePath);
        if (typeof button !== "object") return;
        this.buttons.set(button.name, button);
        this.logger.log(`Loaded ${button.name}`);
        added++;
      } catch (ex) {
        failed += 1;
        Logger.error(`${file}`, ex);
      }
    });
    this.logger.log(`Loaded ${added} buttons. Failed ${failed}`);
  }

  /**
   * Load prefix command on startup
   * @param dir
   */
  loadPrefix(dir: string) {
    this.logger.log(chalk.blueBright("<------------ Loading Prefix --------------->"));
    let added = 0;
    let failed = 0;
    recursiveReadDir(dir).forEach(async (filePath): Promise<void> => {
      const file = path.basename(filePath);
      try {
        const { default: command } = await import(filePath);

        this.prefix.set(command.data.name, command);
        command.data?.aliases?.forEach((al: string) => this.prefix.set(al, command));
        this.logger.log(`Loaded ${command.data.name}`);
        added++;
      } catch (err) {
        failed++;
        Logger.error(`${file}`, err);
      }
    });

    this.logger.log(`Loaded ${added} Prefix Commands. Failed ${failed}`);
  }

  /**
   * Register Slash Commands
   */
  async registerCommands(): Promise<void> {
    const toRegister: SlashCommand["data"][] = [];
    this.commands
      .map((cmd) => ({
        name: cmd.data.name,
        description: cmd.data.description,
        type: 1,
        options: cmd.data?.options,
        integration_types: cmd.data.integration_types,
        ...(cmd.data.userPermissions && {
          default_member_permissions: cmd.data.userPermissions
            .reduce((accumulator, permission) => accumulator | PermissionFlagsBits[permission], BigInt(0)).toString(),
        }),
        contexts: cmd.data.contexts,
        dm_permission: cmd.data?.dm_permission,
      }))
      .forEach((s) => toRegister.push(s));

    await this.rest.put(Routes.applicationCommands(this.user.id), {
      body: toRegister,
    });

    this.logger.success("Successfully registered interactions");
  }
}