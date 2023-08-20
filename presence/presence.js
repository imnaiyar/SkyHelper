const { Client, GatewayIntentBits, ActivityType} = require('discord.js');
const cron = require('node-cron');
const config = require('../config.json');
const {shardsTime} = require('./shardsTime')
const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages, 
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessageReactions,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.GuildMembers,
     ] });


     client.on('ready', () => {
      
      cron.schedule('*/1 * * * *', async () => {
        const status = await shardsTime();
        client.user.setPresence({
          activities: [{ name: status, type: ActivityType.Custom }],
          status: 'online',
        });
      });
    });  
    const token = config.token;
    client.login(token);