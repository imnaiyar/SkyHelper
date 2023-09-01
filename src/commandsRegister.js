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
client.commands = new Collection();

const commands = [];
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);


const commandDirectory = path.join(__dirname, './commands');
const commandFiles = fs.readdirSync(commandDirectory).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.on('ready', async () => { 
    client.commands.forEach(command => {
      commands.push(command.data);
    });
  
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