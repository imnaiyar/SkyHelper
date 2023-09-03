const { Client, GatewayIntentBits, WebhookClient,EmbedBuilder,  ActionRowBuilder, ButtonBuilder, PermissionsBitField, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Constants} = require('discord.js');
const { initializeMongoose } = require("@src/database/mongoose");
const { setupPresence } = require('@handler/presence/presence');
const {shardTimeline} = require('@shards/shardsTimeline.js')
const {shardLocation} = require('@shards/shardsLocation')
const {shardInfos} = require('@shards/aboutShards')
const fs = require('fs');
const path = require('path');
const Logger = require('@src/logger')
const client = new Client({
   intents: [
     GatewayIntentBits.Guilds,
     GatewayIntentBits.GuildMessages, 
     GatewayIntentBits.MessageContent,
     GatewayIntentBits.DirectMessageReactions,
     GatewayIntentBits.DirectMessages,
     GatewayIntentBits.GuildMembers,
    ] });
  process.on("uncaughtException", (erorr) => Logger.error(`Unhandled exception`, erorr));
  process.on("unhandledRejection", (error) => Logger.error(`Unhandled exception`, error));
initializeMongoose();
client.on('ready', () => { 
   Logger.success(`Logged in as ${client.user.tag}`); 
   
require('@root/website/mainPage')
 });
client.on
   ('interactionCreate', async (interaction) => {
     const Art = await client.users.fetch('504605855539265537');
     const Zhii = await client.users.fetch('650487047160725508');
     const Gale = await client.users.fetch('473761854175576075');
     const Clement = await client.users.fetch('693802004018888714');
     const Christian = await client.users.fetch('594485678625128466');
    shardTimeline(interaction, Zhii, Christian);
    shardLocation(interaction, Gale, Clement);
    shardInfos(interaction, Art);
  });
  setupPresence(client);
const loadEventHandlers = (dir) => {
  const files = fs.readdirSync(path.join(__dirname, dir));

  for (const file of files) {
    const filePath = path.join(dir, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory()) {
      loadEventHandlers(filePath);
    } else if (file.endsWith('.js')) {
      // If it's a JavaScript file, load the event handler
      const eventHandler = require(path.join(__dirname, filePath));
      const eventName = file.split('.')[0]; 
      client.on(eventName, (...args) => eventHandler(client, ...args));
    }
  }
};

loadEventHandlers('./src/events');


module.exports = {client}
client.login(process.env.TOKEN);