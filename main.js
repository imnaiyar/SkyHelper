const { Client, GatewayIntentBits, WebhookClient,EmbedBuilder,  ActionRowBuilder, ButtonBuilder, PermissionsBitField, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Constants} = require('discord.js');
const { initializeMongoose } = require("@src/database/mongoose");
const { setupPresence } = require('@events/presence');
const {shardTimeline} = require('@shards/shardsTimeline.js')
const {shardLocation} = require('@shards/shardsLocation')
const {shardInfos} = require('@shards/aboutShards')
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
  client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(process.env.PREFIX)) return;
  if (message.author.id !== '851588007697580033') return;

  const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
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

  const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/); // Parse command arguments
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



module.exports = {client}
client.login(process.env.TOKEN);