const Logger = require('@src/logger');
const { EmbedBuilder } = require('discord.js')
const { spawn } = require('child_process');
module.exports = {
  data: {
    name: 'destroy',
    description: 'Destroy client instance',
    category: 'OWNER',
  },
  async execute(message, args, client) {
    const option = args[0];
    const reloading = new EmbedBuilder().setColor(client.config.EMBED_COLORS.WARNING).setAuthor({name: message.client.user.username, iconURL: message.client.user.avatarURL({dynamic: true})}).setTitle("Bot Reload").setDescription(`Reloading ${message.client.user.username}${option != "bot" ? " " + option : ""}...`).setTimestamp(Date.now());
    const success =  new EmbedBuilder().setColor(client.config.EMBED_COLORS.SUCCESS).setAuthor({name: message.client.user.username, iconURL: message.client.user.avatarURL({dynamic: true})}).setTitle("Bot Reloaded").setDescription(`${message.client.user.username} ${option != "bot" ? option : ""} has been reloaded successfully!`).setTimestamp(Date.now());
    switch(option) {
      case "bot": {
        try {
          const reply = await message.reply({embeds: [reloading]});
          spawn(process.argv[0], process.argv.slice(1), {
            detached: true,
            stdio: 'ignore',
          }).unref();
          reply.edit({embeds: [success]});
          process.exit(0);
        } catch (error) {
          const failed = new EmbedBuilder().setColor(client.config.EMBED_COLORS.ERROR).setAuthor({name: message.client.user.username, iconURL: message.client.user.avatarURL({dynamic: true})}).setTitle("Infinity Reload").setDescription("Failed to reload Bot").addFields({name: "Error Detail:", value: "```js\n" + error + "```"}).setTimestamp(Date.now());
          message.reply({embeds: [failed]});
        }
        break;
      }
      case "cmds":
      case "commands":{
        const reply = await message.reply({embeds: [reloading]});
        message.client.commands.clear();
        message.client.prefix.clear();
        message.client.loadSlashCmd("src/commands");
        reply.edit({embeds: [success]});
        return;
      }
      default:
        await message.reply("Invalid option, availabe options:\n- `bot`: reloads the whole bot.\n- `commands`: reloads commands only (including contexts)");
        break;
    }
  },
};
