const { Client, GatewayIntentBits, WebhookClient,EmbedBuilder,  ActionRowBuilder, ButtonBuilder, PermissionsBitField, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Constants} = require('discord.js');
const { initializeMongoose } = require("@src/database/mongoose");
const { setupPresence } = require('@events/presence');
const { slashListener, prefixListener} = require('@src/commands/commandListener');
const { registerEventHandlers, } = require('@src/commands/eventHandlers');
const {shardTimeline} = require('@shards/shardsTimeline.js')
const {shardLocation} = require('@shards/shardsLocation')
const {shardInfos} = require('@shards/aboutShards')
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
initializeMongoose();
client.on('ready', () => { 
   console.log(`Logged in as ${client.user.tag}`); 
   
require('@root/website/mainPage')
 registerEventHandlers(); 
 });
 const Logger = process.env.COMMANDS_USED ? new WebhookClient({ url: process.env.COMMANDS_USED }) : undefined;
client.on
   ('interactionCreate', async (interaction) => {
    
    const embed = new EmbedBuilder()
    .setTitle("New command used")
    .addFields(
      { name: `Command`, value: `\`${interaction}\`` },
      { name: `User`, value: `${interaction.user.username} \`[${interaction.member.id}]\`` },
      { name: `Server`, value: `${interaction.guild.name} \`[${interaction.guild.id}]\`` },
      { name: `Channel`, value: `${interaction.channel.name} \`[${interaction.channel.id}]\`` }
    )
    .setColor('Blurple')
    .setTimestamp();

  // Slash Commands
  if (interaction.isChatInputCommand()) {
    Logger.send({ username: "Command Logs", embeds: [embed] }).catch((ex) => {});
  }
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



  client.on('messageCreate', (message) => {
    prefixListener(message);
  });
module.exports = {client}
client.login(process.env.TOKEN);