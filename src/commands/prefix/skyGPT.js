const {PermissionsBitField} = require('discord.js')
const { getSettings } = require("@schemas/Guild");

module.exports = {
  data: {
  name: 'skygpt', 
  description: 'configurations for Sky AI support.',
  userPermissions: 'ManageGuild',
  longDesc: `SkyGPT, built upon OpenAI's ChatGPT, is designed to assist with questions related to the game 'Sky: Children of the Light.' It embodies a playful and witty personality, drawing from training on Sky's data. Please note that ChatGPT's knowledge is current up to 2021, and it may occasionally provide incorrect information. For accuracy, consider verifying with other players. This feature is primarily for entertainment.
  
\`Usage:\`
- skygpt set #channel: Set up the bot to respond to messages in the specified channel.
- skygpt stop: Stop the bot's responses in all channels it's been configured for in a server.
 - Requires user to have \` Manage Server \` permission to configure this command.

The bot will respond to all messages in the designated channel as configured during setup. To make the bot ignore a message, simply prepend it with a '?'.`,
  },
  async execute(message, args) {
     const settings = await getSettings(message.guild);
      if (args[0] === 'set') {
        if (args.length === 2) {
          const channelID = args[1].replace(/<#|>/g, ''); // Extract channel ID
      if (settings.skyGPT) {
        return message.reply('There\'s already an existing channel');
      };
      const targetChannel = message.guild.channels.cache.get(channelID);
      settings.skyGPT = targetChannel.id;
      await settings.save();
    if (targetChannel) {
      message.channel.send(`I will now provide Sky CoTL AI support in ${targetChannel.toString()}.`);
    } else {
      message.channel.send(`I will now provide Sky CoTL AI support in the specified channel.`);
    }
  } else {
    message.channel.send('Invalid command usage. Use `!skygpt set #channel` to specify a target channel.');
  }
      }

      // Stop responding in target channel
      else if (args[0] === 'stop') {
        const channel = settings.skyGPT
        if (!settings.skyGPT){
          return message.reply('Sky AI support is already disabled for this server')
        } else {
        settings.skyGPT = null;
        await settings.save();
        message.channel.send(`SkyGPT will no longer respond in the <#${channel}>`);
        }
      } else {
        return message.reply("Invalid command usage `!skyGPT set #channel` or `!skyGPT stop`")
      }
      
  }
}