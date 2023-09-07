const { Client, GatewayIntentBits, WebhookClient,EmbedBuilder,  ActionRowBuilder, ButtonBuilder, PermissionsBitField, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Constants} = require('discord.js');
const { initializeMongoose } = require("@src/database/mongoose");
const { setupPresence } = require('@handler/presence/presence');
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
     GatewayIntentBits.GuildMessageReactions
    ] });
process.on("uncaughtException", (erorr) => Logger.error(`Unhandled exception`, erorr));
process.on("unhandledRejection", (error) => Logger.error(`Unhandled exception`, error));
initializeMongoose();

setupPresence(client);
const loadEventHandlers = (dir) => {
  const files = fs.readdirSync(path.join(__dirname, dir));
  let eventCounter = 0; // Initialize a counter variable

  for (const file of files) {
    const filePath = path.join(dir, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory()) {
      // Recursively load event handlers in nested folders
      eventCounter += loadEventHandlers(filePath);
    } else if (file.endsWith('.js')) {
      const eventHandler = require(path.join(__dirname, filePath));
      const eventName = file.split('.')[0];
      client.on(eventName, (...args) => eventHandler(client, ...args));
      eventCounter++; // Increment the counter for each loaded event
    }
  }

  return eventCounter; // Return the total count of events in this folder and its subfolders
};

const totalEventsLoaded = loadEventHandlers('./src/events');
Logger.log(`Loaded ${totalEventsLoaded} events.`);

module.exports = {client}
client.login(process.env.TOKEN);