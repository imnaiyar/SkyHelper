const { Client, GatewayIntentBits, Collection, Partials } = require("discord.js");
const { table } = require("table");
const moment = require("moment-timezone");
const { recursiveReadDirSync, validations, cmdValidation } = require("@handler");
const { schemas } = require("@src/database/mongoose");
const fs = require("fs");
const path = require("path");
const Logger = require("@src/logger");
module.exports = class SkyHelper extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
      ],
      partials: [Partials.Channel, Partials.Message, Partials.GuildMember],
    });
    this.config = require("@root/config.js");
    this.logger = Logger;

    /**
     * @type {Collection<string, import('./SlashCommands.js')>}
     */
    this.commands = new Collection();

    /**
     * @type {Collection<string, Collection<string, Date>>}
     */
    this.cooldowns = new Collection();

    /**
     * Timezone for various time based calculations.
     * Timezone is defaultly set to "America/Los_Angeles" ,
     * as the developer of the game (TGC) is based from California
     * @type {string} 
     */
    this.timezone = "America/Los_Angeles";

    /**
     * @type {Collection<string, Object>}
     */
    this.prefix = new Collection();
    this.database = schemas;
    // Datas for Events in Sky
    /**
     * Stores current/upcoming events (in Sky) details
     * @type {object} 
     */
    this.skyEvents = {
      eventActive: true,
      eventName: "Days of Fortune",
      eventStarts: moment.tz("2024-01-29T00:00:00", this.timezone),
      eventEnds: moment.tz("2024-02-11T23:59:59", this.timezone),
      eventDuration: "13 days",
    };

    // user object cache for credits
    /**
     * Stores users fetched from API that are not in bot's cache
     * @type {Map<string, import('discord.js').User>} 
     */
    this.userCache = new Map();

    // game data for quiz game
    /**
     * Stores active guiz game datas
     * @type {Map<String, Object>}
     */
    this.gameData = new Map();

    // Checks for how this class is created so it doesnt mess up the process
    if (
      require.main.filename !== path.join(process.cwd(), "src", "commandsRegister.js") &&
      this.config.DASHBOARD.enabled
    ) {
      const { loadWebsite } = require("@root/web/server.js");
      loadWebsite(this);
    }
  }

  /**
   * Validate environment variable
   */
  async validate() {
    const vld = await validations();
    if (!vld) {
      process.exit(1);
    }
  }

  /**
   * Load all events from the specified directory
   * @param {string} directory
   */
  loadEvents(directory) {
    Logger.log(`Loading events...`);
    let success = 0;
    let failed = 0;
    const clientEvents = [];

    recursiveReadDirSync(directory).forEach((filePath) => {
      const file = path.basename(filePath);
      try {
        const eventName = path.basename(file, ".js");
        const event = require(filePath);

        this.on(eventName, event.bind(null, this));
        clientEvents.push([file, "✓"]);

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
          alignment: "center",
          content: "Client Events",
        },
        singleLine: true,
        columns: [{ width: 25 }, { width: 5, alignment: "center" }],
      })
    );

    Logger.log(`Loaded ${success + failed} events. Success (${success}) Failed (${failed})`);
  }

  /**
   * Load slash command to client on startup
   * @param {string} dir
   */
  loadSlashCmd(dir) {
    
    const directory = path.resolve(process.cwd(), dir);
    const files = fs.readdirSync(directory);

    for (const file of files) {
      const filePath = path.resolve(directory, file);
      const fileStat = fs.statSync(filePath);

      if (fileStat.isDirectory()) {
        if (file !== "sub" && file !== "prefix") {
          this.loadSlashCmd(filePath);
        }
      } else if (file.endsWith(".js") && !file.startsWith("skyEvents")) {
        const command = require(filePath);
        const vld = cmdValidation(command, file);
        if (!vld) continue;
        this.commands.set(command.data.name, command);
      }
    }
  }

  /**
   * Load prefix command on startup
   * @param {string} dir
   */
  loadPrefix(dir) {
    const prefixDirectory = path.join(process.cwd(), dir);
    const commandFiles = fs.readdirSync(prefixDirectory).filter((file) => file.endsWith(".js"));

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
        options: cmd.data?.options,
        dm_permission: cmd.data?.dm_permission,
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
      scopes: ["bot", "applications.commands"],
      permissions: 412317243584n,
    });
  }

  /**
   * @param {import('discord.js').TextChannel} channel - channel where webhook is created in
   * @param {string} name - name of the webhook
   * @param {string} avatar - avatar of the webhook
   */
  async createWebhook(channel,reason, name, avatar) {
    const webhook = await channel.createWebhook({
      name: name ? name : "SkyHelper",
      avatar: avatar ? avatar : this.user.displayAvatarURL(),
      reason: reason ? reason : "SkyHelper Webhook",
    });
    return webhook;
  }

  /**
   * get commands from client application
   * @param {string|number} value - command name or id
   */
  async getCommand(value) {
    if (!value) throw new Error('Command "name" or "id" must be passed as an argument');
    await this.application.commands.fetch();
    const command =
      typeof value === "string" && isNaN(value)
        ? this.application.commands.cache.find((cmd) => cmd.name === value.toLowerCase())
        : !isNaN(value)
        ? this.application.commands.cache.get(value)
        : (() => {
            throw new Error("Provided Value Must Either be a String or a Number");
          })();
    if (!command) throw new Error("No matching command found");
    return command;
  }

  /**
   * Get user from discord API and cache it for later use.
   * If user is not cached, an user ID must be provided.
   * If user is cached, an user name must be provided.
   * If user is cached and an user ID is provided, it will be ignored.
   * @param {string} name - name of the user
   * @param {string} id - ID of the user
   */
  async getUser(name, id) {
    if (!name) throw new Error('User "name" must be provide');
    if (typeof name !== "string") throw new Error("User name must be a String");
    let user = this.userCache.get(name);
    if (!user) {
      if (!id) throw new Error("User is not cached, an user ID must be provided");
      if (isNaN(parseInt(id))) throw new Error("User ID must be a number");
      user = this.users.cache.get(id) || (await this.users.fetch(id));
      this.userCache.set(name, user);
    }
    return user;
  }

  /**
   * Leaves a specified guild
   * @param {string} id - guild id
   */
  leaveServer(id) {
    if (isNaN(parseInt(id))) throw new Error("Guild Id must be a number");
    const guildToLeave = this.guilds.cache.get(id);
    if (!guildToLeave) throw new Error("There's no guild associated with the given ID that I am in");
    guildToLeave.leave();
    return `Succesfully left ${guildToLeave.name} (${guildToLeave.id})`;
  }
};
