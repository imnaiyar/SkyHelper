const {
  Client,
  GatewayIntentBits,
  WebhookClient,
  Collection,
  EmbedBuilder,
} = require('discord.js');

const { DASHBOARD } = require('@root/config');
const { initializeMongoose } = require('@src/database/mongoose');
const { setupPresence } = require('@handler/presence/presence');
const fs = require('fs');
const path = require('path');
const Logger = require('@src/logger');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
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

client.once('ready', async () => {
  // Setting up events
  const loadEventHandlers = (dir) => {
    const files = fs.readdirSync(path.join(__dirname, dir));
    let eventCounter = 0;

    for (const file of files) {
      const filePath = path.join(dir, file);
      const fileStat = fs.statSync(filePath);

      if (fileStat.isDirectory()) {
        eventCounter += loadEventHandlers(filePath);
      } else if (file.endsWith('.js')) {
        const eventHandler = require(path.join(__dirname, filePath));
        const eventName = file.split('.')[0];
        client.on(eventName, (...args) => eventHandler(client, ...args));
        eventCounter++;
      }
    }

    return eventCounter;
  };

  const totalEventsLoaded = loadEventHandlers('./src/events');
  Logger.log(`Loaded ${totalEventsLoaded} events.`);

  Logger.success(`Logged in as ${client.user.tag}`);

  // Setting Up Slash Commands
  client.commands = new Collection();
  client.cooldowns = new Collection();
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
  require('@root/website/mainPage');

  // Send ready webhook log
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
        value: `Website started on port ${DASHBOARD.port}`,
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

// auto shard updates
client.on('ready', async() => {
  
});

// setup mongoose
initializeMongoose();

//bots presence
setupPresence(client);

// Exporting client should I need it somewhere
module.exports = { client };
client.login(process.env.TOKEN);
