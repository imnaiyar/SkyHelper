import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import * as moment from 'moment-timezone';
import config from '#src/config';
import { recursiveReadDir } from 'skyhelper-utils';
import { logger as Logger } from '#handlers';
import * as path from 'node:path';
import * as chalk from 'chalk';
import { table } from 'table';
export class SkyHelper extends Client {
    config;
    commands;
    prefix;
    buttons;
    cooldowns;
    timezone;
    skyEvents;
    classes;
    ts;
    logger;
    gameData;
    emojisMap;
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
                GatewayIntentBits.GuildMessageReactions
            ],
            partials: [Partials.Channel, Partials.GuildMember, Partials.Message]
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
            eventDuration: '12 days'
        });
        this.classes = new Collection();
        this.ts = {
            name: 'Hairtousle Teen',
            visitDate: 'kujwdhcbdc',
            departDate: 'khdbcs',
            spiritImage: 'djncd',
            value: 'dfjn',
            index: 'dbjcm'
        };
        this.gameData = new Map();
        this.emojisMap = new Map();
        this.spiritsData = null;
    }
    /**
     * Load all events from the specified directory
     * @param directory
     */
    loadEvents(directory) {
        this.logger.log(chalk.blueBright("<------------ Loading Events --------------->"));
        let success = 0;
        let failed = 0;
        const clientEvents = [];
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
            }
            catch (ex) {
                failed += 1;
                Logger.error(`loadEvent - ${file}`, ex);
            }
        });
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
        recursiveReadDir(dir, ['prefix', 'sub']).forEach((filePath) => {
            const file = path.basename(filePath);
            try {
                delete require.cache[require.resolve(filePath)];
                const command = require(filePath);
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
     * Load buttons to client on startup
     * @param dir
     */ ;
    loadButtons(dir) {
        this.logger.log(chalk.blueBright("<------------ Loading Buttons -------------->"));
        let added = 0;
        let failed = 0;
        recursiveReadDir(dir).forEach((filePath) => {
            const file = path.basename(filePath);
            try {
                delete require.cache[require.resolve(filePath)];
                const button = require(filePath);
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
}
