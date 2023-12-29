const {
  Client,
  GatewayIntentBits,
  WebhookClient,
  Collection,
  EmbedBuilder,
  Partials,
} = require('discord.js');
const { table } = require('table');
const moment = require('moment-timezone');
const {
  recursiveReadDirSync,
} = require('@handler/functions/recursiveReadDirSync');
const { validations } = require('@handler/validations');
const { schemas } = require('@src/database/mongoose');
const { cmdValidation } = require('@handler/cmdValidation');
const fs = require('fs');
const path = require('path');
const Logger = require('@src/logger');
module.exports = class SkyHelper extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,

        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessages,

        GatewayIntentBits.GuildMessageReactions,
      ],
      partials: [Partials.Channel, Partials.Message],
    });
    this.config = require('./config.js');
    this.logger = Logger;
    this.commands = new Collection();
    this.cooldowns = new Collection();
    this.timezone = 'America/Los_Angeles';
    this.prefix = new Collection();
    this.database = schemas;
    this.skyEvents = {
    eventActive: true,
    eventName: 'Days of Feast',
    eventStarts: moment.tz('2023-12-18T00:00:00', this.timezone),
    eventEnds: moment.tz('2024-01-07T23:59:59', this.timezone),
    eventDuration: '21 days',
};
    if (process.mainModule.filename !== `${process.cwd()}/src/commandsRegister.js` && this.config.DASHBOARD.enabled) {
      const { loadWebsite } = require('./website/mainPage');
      loadWebsite(this);
    }
  }
  
  /**
   * Validaye environment variable
   */
   async validate() {
     const vld = await validations();
  if (!vld) {
    process.exit(1);
  }
   }

  /**
   * Load all events from the specified directory
   */
  loadEvents(directory) {
    Logger.log(`Loading events...`);
    let success = 0;
    let failed = 0;
    const clientEvents = [];

    recursiveReadDirSync(directory).forEach((filePath) => {
      const file = path.basename(filePath);
      try {
        const eventName = path.basename(file, '.js');
        const event = require(filePath);

        this.on(eventName, event.bind(null, this));
        clientEvents.push([file, '✓']);

        delete require.cache[require.resolve(filePath)];
        success += 1;
      } catch (ex) {
        failed += 1;
        Logger.error(`loadEvent - ${file}`, ex);
      }
    });

    console.log(
      table(clientEvents, {
        header: {
          alignment: 'center',
          content: 'Client Events',
        },
        singleLine: true,
        columns: [{ width: 25 }, { width: 5, alignment: 'center' }],
      }),
    );

    Logger.log(
      `Loaded ${
        success + failed
      } events. Success (${success}) Failed (${failed})`,
    );
  }

  /**
   * Load slash command to client on startup
   */
  loadSlashCmd(dir) {
    const directory = path.resolve(__dirname, dir);
    const files = fs.readdirSync(directory);

    for (const file of files) {
      const filePath = path.resolve(directory, file);
      const fileStat = fs.statSync(filePath);

      if (fileStat.isDirectory()) {
        if (file !== 'sub' && file !== 'prefix') {
          this.loadSlashCmd(filePath);
        }
      } else if (file.endsWith('.js') && !file.startsWith('skyEvents')) {
        const command = require(filePath);
       const vld =  cmdValidation(command, file);
       if (!vld) continue;
        this.commands.set(command.data.name, command);
      }
    }
  }

  /**
   * Load prefix command on startup
   */
  loadPrefix(dir) {
    const prefixDirectory = path.join(__dirname, dir);
    const commandFiles = fs
      .readdirSync(prefixDirectory)
      .filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(`@src/commands/prefix/${file}`);
      this.prefix.set(command.data.name, command);
    }
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
          options: cmd.data.options,
        }))
        .forEach((s) => toRegister.push(s));

      await this.application.commands.set(toRegister);
    

    this.logger.success("Successfully registered interactions");
  }
  /**
   * Get bot's invite
   */
  getInvite() {
    return this.generateInvite({
      scopes: ['bot', 'applications.commands'],
      permissions: 412317243584n,
    });
  }
};
