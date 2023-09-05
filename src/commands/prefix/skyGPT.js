const {PermissionsBitField} = require('discord.js')
const { getSettings } = require("@schemas/Guild");

module.exports = {
  name: 'skygpt', 
  description: 'configurations for Sky AI support.',
  userPermissions: 'ManageGuild', 

  async execute(message, args) {
  if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
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
      } else {
      return message.reply('This feature can only configure by an administrator.')
    }
  }
}