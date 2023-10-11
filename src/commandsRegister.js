const {Client, Collection, GatewayIntentBits} = require("discord.js"); 
 require('module-alias/register'); 
 require('dotenv').config(); 
 const { REST } = require('@discordjs/rest'); 
 const fs = require('fs'); 
 const path = require('path'); 
 const { Routes } = require('discord-api-types/v9'); 
 const Logger = require('./logger'); 
 const client = new Client({ 
     intents: [ 
       GatewayIntentBits.Guilds, 
       GatewayIntentBits.GuildMessages,  
       GatewayIntentBits.MessageContent, 
       GatewayIntentBits.DirectMessageReactions, 
       GatewayIntentBits.DirectMessages, 
       GatewayIntentBits.GuildMembers, 
      ] }); 
  
 const rest = new REST({ version: '9' }).setToken(process.env.TOKEN); 
  
  
 const commandDirectory = path.join(__dirname, './commands'); 
 const commands = []; 
  
 // Function to recursively search for command files 
 function findCommandFiles(directory) { 
   const files = fs.readdirSync(directory); 
  
   for (const file of files) { 
     const filePath = path.join(directory, file); 
     const fileStat = fs.statSync(filePath); 
  
     if (fileStat.isDirectory()) { 
       // If it's a directory and not named "sub," recursively search it 
       if (file !== 'sub' && file !== 'prefix') { 
         findCommandFiles(filePath); 
       } 
     } else if (file.endsWith('.js') && !file.startsWith('skyEvents')) { 
       const command = require(filePath); 
       commands.push(command.data); 
     } 
   } 
 } 
  
 // Start the search from the "commandDirectory" 
 findCommandFiles(commandDirectory); 
  
  
 client.on('ready', async () => {  
  
     try { 
      Logger.success('Started refreshing application (/) commands.'); 
  
       await rest.put( 
         // Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), // If you want the commands to be guild specific 
         Routes.applicationCommands(client.user.id),  
         { body: commands }, 
       ); 
  
       Logger.success(`Registered ${commands.length} commands`); 
  
       Logger.success('Successfully reloaded application (/) commands.'); 
       client.destroy(); 
     } catch (error) { 
       Logger.error(error); 
     } 
 }) 
  
 client.login(process.env.TOKEN);