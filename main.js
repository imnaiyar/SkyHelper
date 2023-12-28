const {
  Client,
  GatewayIntentBits,
  WebhookClient,
  Collection,
  EmbedBuilder,
  Partials,
} = require('discord.js');
const { table } = require('table');
const { validations } = require('@handler/validations');
const { DASHBOARD } = require('@root/config');
const cron = require('node-cron');
const { shardsUpdate } = require('@handler/shardsUpdate');
const { timesUpdate } = require('@handler/timesUpdate');
const {
  recursiveReadDirSync,
} = require('@handler/functions/recursiveReadDirSync');
const { initializeMongoose } = require('@src/database/mongoose');
const { setupPresence } = require('@handler/presence/presence');
const fs = require('fs');
const path = require('path');
const Logger = require('@src/logger');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,

    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessages,

    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Channel, Partials.Message],
});

const ready = process.env.READY_LOGS
  ? new WebhookClient({ url: process.env.READY_LOGS })
  : undefined;

process.on('uncaughtException', (erorr) =>
  Logger.error(`Unhandled exception`, erorr),
);
process.on('unhandledRejection', (error) =>
  Logger.error(`Unhandled exception`, error),
);
// Validation
const vld = validations();
if (!vld) {
  process.exit();
}
client.once('ready', async () => {
  // Setting up configs
  client.config = require('./config.js');
  // Setting up events
  function loadEvents(directory) {
    Logger.log(`Loading events...`);
    let success = 0;
    let failed = 0;
    const clientEvents = [];

    recursiveReadDirSync(directory).forEach((filePath) => {
      const file = path.basename(filePath);
      try {
        const eventName = path.basename(file, '.js');
        const event = require(filePath);

        client.on(eventName, event.bind(null, client));
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

  loadEvents('./src/events');

  Logger.success(`Logged in as ${client.user.tag}`);

  client.commands = new Collection();
  client.cooldowns = new Collection();
  client.timezone = 'America/Los_Angeles';
  // slash commands set up
  const commandDirectory = path.join(__dirname, './src/commands');
  function findCommandFiles(directory) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
      const filePath = path.join(directory, file);
      const fileStat = fs.statSync(filePath);

      if (fileStat.isDirectory()) {
        if (file !== 'sub' && file !== 'prefix') {
          findCommandFiles(filePath);
        }
      } else if (file.endsWith('.js') && !file.startsWith('skyEvents')) {
        const command = require(filePath);
        client.commands.set(command.data.name, command);
      }
    }
  }
  findCommandFiles(commandDirectory);

  // Setting up Prefix commands
  client.prefix = new Collection();

  const prefixDirectory = path.join(__dirname, './src/commands/prefix');
  const commandFiles = fs
    .readdirSync(prefixDirectory)
    .filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`@src/commands/prefix/${file}`);
    client.prefix.set(command.data.name, command);
  }

  // Load Website
  if (DASHBOARD.enabled) {
    require('@root/website/mainPage');
  }
  // Send ready webhook log
  let text;
  if (client.config.DASHBOARD.enabled) {
    text = `Website started on port ${DASHBOARD.port}`;
  } else {
    text = 'Website is disabled';
  }
  const readyalertemb = new EmbedBuilder()
    .addFields(
      {
        name: 'Bot Status',
        value: `Total guilds: ${
          client.guilds.cache.size
        }\nTotal Users: ${client.guilds.cache.reduce(
          (size, g) => size + g.memberCount,
          0,
        )}`,
        inline: false,
      },
      {
        name: 'Website',
        value: text,
        inline: false,
      },
      {
        name: 'Interactions',
        value: `Loaded Interactions`,
        inline: false,
      },
      {
        name: 'Success',
        value: `SkyHelper is now online`,
      },
    )
    .setColor('Gold')
    .setTimestamp();

  // Ready alert
  if (ready) {
    ready.send({
      username: 'Ready',
      avatarURL: client.user.displayAvatarURL(),
      embeds: [readyalertemb],
    });
  }

  // Fetching Application info for eval purposes.
  await client.application.fetch();
});

// setup mongoose
initializeMongoose();

//bots presence
setupPresence(client);

// auto shard function
cron.schedule('*/5 * * * *', async () => {
  try {
    await shardsUpdate(client);
  } catch (err) {
    Logger.error(err);
  }
});

cron.schedule('*/2 * * * *', async () => {
  try {
    await timesUpdate(client);
  } catch (err) {
    Logger.error(err);
  }
});
// Exporting client should I need it somewhere
module.exports = { client };
client.login(process.env.TOKEN);
