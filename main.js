const { Client, GatewayIntentBits, ActivityType,EmbedBuilder,  ActionRowBuilder, ButtonBuilder, PermissionsBitField, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Constants} = require('discord.js');
const config = require('./config.json');
require('./presence/presence');
const { setupPresence } = require('./presence/presence');
const { slashListener, prefixListener} = require('./eventhandler/commandListener');
const { registerEventHandlers, } = require('./eventhandler/eventHandlers');
const {shardTimeline} = require('./interactionhandler/shards/shardsTimeline.js')
const {shardLocation} = require('./interactionhandler/shards/shardsLocation')
const {shardInfos} = require('./interactionhandler/shards/aboutShards')
const client = new Client({
   intents: [
     GatewayIntentBits.Guilds,
     GatewayIntentBits.GuildMessages, 
     GatewayIntentBits.MessageContent,
     GatewayIntentBits.DirectMessageReactions,
     GatewayIntentBits.DirectMessages,
     GatewayIntentBits.GuildMembers,
    ] });
    process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});


client.on('ready', () => { 
   console.log(`Logged in as ${client.user.tag}`); 
  
 registerEventHandlers(); 
    let totalMembers = 0;

  // Iterate through all guilds (servers) the bot is a member of

  client.guilds.cache.forEach(guild => {

    totalMembers += guild.memberCount;

  });

  console.log(`Total members across all servers: ${totalMembers}`);
 });
client.on
   ('interactionCreate', async (interaction) => {
     const Art = await client.users.fetch('504605855539265537');
     const Zhii = await client.users.fetch('650487047160725508');
     const Gale = await client.users.fetch('473761854175576075');
     const Clement = await client.users.fetch('693802004018888714');
     const Christian = await client.users.fetch('594485678625128466');
     
    slashListener(interaction);
    shardTimeline(interaction, Zhii, Christian);
    shardLocation(interaction, Gale, Clement);
    shardInfos(interaction, Art);
  });
  setupPresence(client);
  client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;
  if (message.author.id !== '851588007697580033') return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
   if (command === 'maintenance') {

    await message.delete();


    const response = '\*\*\_\_Maintenance Alert\_\_\*\*\nBot will go under maintenance soon. It\'ll be down during this period\n\*\*Expected down time:\*\* Aprrox. 5 minutes';
    await message.channel.send(response);
  } else if (command === 'update') {
    // Delete the command message
    await message.delete();

    // Send a response
    const response = "**Update (`/seasonal_guides`):Seasonal guides have been updated upto **__Season of Performance__**";
    await message.channel.send(response);
  } else if (command === 'maintenanceover') {
    await message.delete();

    const response = 'Maintenance is over. Thanks for your patience.';
    await message.channel.send(response);
  }
  
});

client.on('messageCreate', async message =>  {
  if (!message.content.startsWith('!') || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/); // Parse command arguments
  const command = args.shift().toLowerCase(); // Get the command itself

  if (command === 'tests') {
    await message.deferReply()
    message.editReply(`<:vstrophy:760525592419500073>`);
  } else if (command === 'ping') {
      const start = Date.now();
      const ping = client.ws.ping;
      const end = Date.now();
      const messageLatency = end - start;
      await message.reply(`Bot's response time: ${messageLatency}ms\nBot's Ping - ${ping}ms`)
  }
});



  client.on('messageCreate', (message) => {
    prefixListener(message);
  });

module.exports = {client}
client.login(process.env.TOKEN);