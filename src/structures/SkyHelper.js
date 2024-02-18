const { Client, GatewayIntentBits, Collection, Partials } = require("discord.js");
const spirits = require('../commands//guides/sub/shared/spiritsData.js')
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

    // Shards data
    /**
     * Stores shards commands datas
     * @type {Map<String, Object>}
     */
    this.shardsData = new Map();

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
    
    /**
     * stores current/upcoming ts details
     * @type {Object}
     */
    this.ts = {
      lastOccurence: '',
      name: '',
      location: '',
      tree: '',
      total: ''
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

    /**
     * stores emojis for realms
     * @type {Map<String, Object>}
     */
    this.emojisMap = new Map();
    this.emojisMap.set('realms', {
      "Isle of Dawn": '<:Isle:1150605424752590868>',
      "Daylight Prairie": '<:Prairie:1150605405408473179>',
      "Hidden Forest": '<:Forest:1150605383656800317>',
      "Valley of Triumph": '<:Valley:1150605355777273908>',
      "Golden Wasteland": '<:Wasteland:1150605333862027314>',
      "Vault of Knowledge": '<:Vault:1150605308364861580>',
      "Eye of Eden": '<:eden:1205960597456293969>',
    })
    this.emojisMap.set('seasons', {
      "Nine-Colored Deer": '<:ninecoloreddeer:1197412132657053746>',
      "Revival": '<:revival:1163480957706321950>',
      "Moments": '<:moments:1130958731211985019>',
      "Passage": '<:passage:1130958698571911239>',
      "Rememberance": '<:remembrance:1130958673959719062>',
      "Aurora": '<:aurora:1130958641189621771>',
      "Shattering": '<:shattering:1130961257097334895>',
      "Performance": '<:performance:1130958595345895444>',
      "Abyss": '<:abyss:1130958569748045845>',
      "Flight": '<:flight:1130958544276045945>',
      "The Little Prince": '<:littleprince:1130958521253502987>',
      "Assembly": '<:assembly:1130958465351811173>',
      "Dreams": '<:dreams:1130958442232815646>',
      "Prophecy": '<:prophecy:1130958414655279304>',
      "Sanctuary": '<:sanctuary:1130958391347515573>',
      "Enchantment": '<:enchantment:1130958367674867742>',
      "Rhythm": '<:rhythm:1130958345352777849>',
      "Belonging": '<:belonging:1130958323823423509>',
      "Lightseekers": '<:lightseekers:1130958300293365870>',
      "Gratitude": '<:gratitude:1130958261349261435>',
    })
    
    this.spiritsData = spirits;
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
    this.removeAllListeners();
    recursiveReadDirSync(directory).forEach((filePath) => {
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
        delete require.cache[require.resolve(filePath)];
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
      const filePath = path.join(prefixDirectory, file);
      delete require.cache[require.resolve(filePath)];
      const command = require(filePath);
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
  async createWebhook(channel, reason, name, avatar) {
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

  /**
   * Basic filter for a collector
   * @param {import('discord.js').MessageComponentInteraction} int 
   */
  getFilter(int) {
    const filter = (i) => {
      if (i.user.id !== int.user?.id || int.author?.id) {
        i.reply({
          content:
            "You can't use the menu generated by others.",
          ephemeral: true,
        });
        return false;
      }
      return true;
    };
    return filter;
  }
};
