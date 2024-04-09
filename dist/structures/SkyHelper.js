import { Client, GatewayIntentBits, Partials, Collection, PermissionFlagsBits, Routes, } from "discord.js";
import moment from "moment-timezone";
import config from "#src/config";
import { recursiveReadDir } from "skyhelper-utils";
import { logger as Logger } from "#handlers";
import path from "node:path";
import chalk from "chalk";
import { table } from "table";
import { pathToFileURL } from "node:url";
import spiritsData from "#libs/datas/spiritsData";
/** The bot's client */
export class SkyHelper extends Client {
    /** Configurations for the bot */
    config;
    /** Collection of Slash Commands */
    commands;
    /** Collection of Prefix Commands */
    prefix;
    /** Collection of Context Menu Commands */
    contexts;
    /** Collection of Buttons */
    buttons;
    /** Collection of command cooldowns */
    cooldowns;
    /** Default timezone used thorughout the client for time-based calculations */
    timezone;
    /** A map of events occuring in Sky: COTL */
    skyEvents;
    /** Collection of utility classes */
    classes;
    /** Current Traveling Spirit Data */
    ts;
    /** Custom logger */
    logger;
    /** Map of currently active Quiz game data */
    gameData;
    /** Map of emojis */
    emojisMap;
    /** All the Sky: SCOTL spirits data */
    spiritsData;
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
    async loadEvents(directory) {
        this.logger.log(chalk.blueBright("<------------ Loading Events --------------->"));
        let success = 0;
        let failed = 0;
        const clientEvents = [];
        const dirs = recursiveReadDir(directory);
        for (const filePath of dirs) {
            const file = path.basename(filePath);
            try {
                const eventName = path.basename(file, ".js");
                const { default: event } = await import(pathToFileURL(filePath).href);
                this.on(eventName, event.bind(null, this));
                clientEvents.push([file, "✓"]);
                success += 1;
            }
            catch (ex) {
                failed += 1;
                Logger.error(`loadEvent - ${file}`, ex);
            }
        }
        this.logger.log(`\n${table(clientEvents, {
            header: {
                alignment: "center",
                content: "Client Events",
            },
            singleLine: true,
            columns: [{ width: 25 }, { width: 5, alignment: "center" }],
        })}`);
        Logger.log(`Loaded ${success + failed} events. Success (${success}) Failed (${failed})`);
    }
    /**
     * Load slash command to client on startup
     * @param dir
     */
    loadSlashCmd(dir) {
        this.logger.log(chalk.blueBright("<------------ Loading Slash ---------------->"));
        let added = 0;
        let failed = 0;
        recursiveReadDir(dir, ["prefix", "sub"]).forEach(async (filePath) => {
            const file = path.basename(filePath);
            try {
                const { default: command } = await import(pathToFileURL(filePath).href);
                // const vld = cmdValidation(command, file);
                // if (!vld) return;
                this.commands.set(command.data.name, command);
                this.logger.log(`Loaded ${command.data.name}`);
                added++;
            }
            catch (err) {
                failed++;
                Logger.error(`loadSlashCmds - ${file}`, err);
            }
        });
        this.logger.log(`Loaded ${added} Slash Commands. Failed ${failed}`);
    }
    /**
     * Load context menu commands to client on startup
     * @param dir
     */
    loadContextCmd(dir) {
        this.logger.log(chalk.blueBright("<------------ Loading Contexts ---------------->"));
        let added = 0;
        let failed = 0;
        recursiveReadDir(dir, ["sub"]).forEach(async (filePath) => {
            const file = path.basename(filePath);
            try {
                const { default: command } = await import(pathToFileURL(filePath).href);
                // const vld = cmdValidation(command, file);
                // if (!vld) return;
                this.contexts.set(command.data.name, command);
                this.logger.log(`Loaded ${command.data.name}`);
                added++;
            }
            catch (err) {
                failed++;
                Logger.error(`loaContextCmds - ${file}`, err);
            }
        });
        this.logger.log(`Loaded ${added} Context Menu Commands. Failed ${failed}`);
    }
    /**
     * Load buttons to client on startup
     * @param dir
     */
    loadButtons(dir) {
        this.logger.log(chalk.blueBright("<------------ Loading Buttons -------------->"));
        let added = 0;
        let failed = 0;
        recursiveReadDir(dir).forEach(async (filePath) => {
            const file = path.basename(filePath);
            try {
                delete require.cache[require.resolve(filePath)];
                const { default: button } = await import(pathToFileURL(filePath).href);
                if (typeof button !== "object")
                    return;
                this.buttons.set(button.name, button);
                this.logger.log(`Loaded ${button.name}`);
                added++;
            }
            catch (ex) {
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
    loadPrefix(dir) {
        this.logger.log(chalk.blueBright("<------------ Loading Prefix --------------->"));
        let added = 0;
        let failed = 0;
        recursiveReadDir(dir).forEach(async (filePath) => {
            const file = path.basename(filePath);
            try {
                const { default: command } = await import(pathToFileURL(filePath).href);
                this.prefix.set(command.data.name, command);
                command.data?.aliases?.forEach((al) => this.prefix.set(al, command));
                this.logger.log(`Loaded ${command.data.name}`);
                added++;
            }
            catch (err) {
                failed++;
                Logger.error(`${file}`, err);
            }
        });
        this.logger.log(`Loaded ${added} Prefix Commands. Failed ${failed}`);
    }
    /**
     * Register Slash Commands
     */
    async registerCommands() {
        const toRegister = [];
        this.commands
            .map((cmd) => ({
            name: cmd.data.name,
            description: cmd.data.description,
            type: 1,
            options: cmd.data?.options,
            integration_types: cmd.data.integration_types,
            ...(cmd.data.userPermissions && {
                default_member_permissions: cmd.data.userPermissions
                    .reduce((accumulator, permission) => accumulator | PermissionFlagsBits[permission], BigInt(0))
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
    getInvite() {
        return this.generateInvite({
            scopes: ["bot", "application.commands"],
            permissions: 412317243584n,
        });
    }
    /**
     * @param channel Channel where webhook is to be created
     * @param reason The reason for webhooks creation
     */
    async createWebhook(channel, reason) {
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
    async getCommand(value) {
        if (!value)
            throw new Error('Command "name" or "id" must be passed as an argument');
        await this.application.commands.fetch();
        const command = typeof value === "string" && isNaN(value)
            ? this.application.commands.cache.find((cmd) => cmd.name === value.toLowerCase())
            : !isNaN(value)
                ? this.application.commands.cache.get(value.toString())
                : (() => {
                    throw new Error("Provided Value Must Either be a String or a Number");
                })();
        if (!command)
            throw new Error("No matching command found");
        return command;
    }
}
