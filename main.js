const { Client, GatewayIntentBits, WebhookClient, EmbedBuilder} = require('discord.js');

const { DASHBOARD } = require("@root/config"); 
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
  
const ready = process.env.READY_LOGS ? new WebhookClient({ url: process.env.READY_LOGS }) : undefined;


process.on("uncaughtException", (erorr) => Logger.error(`Unhandled exception`, erorr));
process.on("unhandledRejection", (error) => Logger.error(`Unhandled exception`, error));

client.on('ready', async () =>{
  // Setting up events
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
  
  Logger.success(`Logged in as ${client.user.tag}`); 
   
  require('@root/website/mainPage')
    const readyalertemb = new EmbedBuilder()
      .addFields(
        {
          name: "Bot Status",
          value: `Total guilds: ${client.guilds.cache.size}\nTotal Users: ${client.guilds.cache.reduce((size, g) => size + g.memberCount, 0)}`,
          inline: false,
        },
        {
          name: "Dashboard",
          value: `Dashboard started on port ${DASHBOARD.port}`,
          inline: false,
        },
        {
          name: "Interactions",
          value: `Loaded Interactions`,
          inline: false,
        },
        {
          name: "Success",
          value: `SkyBOT is now online`,
        }
      )
      .setColor('Gold')
      .setTimestamp();
  
    // Ready alert
    if (ready) {
      ready.send({
        username: "Ready",
        avatarURL: client.user.displayAvatarURL(),
        embeds: [readyalertemb],
      });
    }
  
  })
  initializeMongoose();
setupPresence(client);
module.exports = {client}
client.login(process.env.TOKEN);