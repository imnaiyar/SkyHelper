const { EmbedBuilder } = require("discord.js");
const { exec } = require("child_process");

/**
 * @type {import('@src/structures').PrefixCommands}
 */
module.exports = {
  data: {
    name: "reload",
    description: "reloads the bot",
    category: "OWNER",
    args: {
        require: true,
        args: ["bot"]
    },
    flags: ["bot", "files"],
  },
  async execute(msg, args, client, flags) {
    const type = this.data.flags.every(flag => flags.includes(flag)) ? 'Bot and Files' : 'Files';
    msg.channel.send({
      embeds: [
        new EmbedBuilder()
        .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL()})
        .setTitle('Reload')
        .setDescription(`Reloading ${type}`)
        ]
    });

    const refresh = this.data.flags.every(flag => flags.includes(flag)) ? 'bot' : flags[0]

    const pull = async () => {
        const embed = await consoleRun(type, client);
        if (embed === 'Upto date.')  {
            msg.channel.send({ embeds: [
            new EmbedBuilder()
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL()})
            .setTitle('Upto date')
            .setDescription(`Local branch is already upto date with remote branch, nothing to update`)
            .setTimestamp()
        ]})
        return;
    }
    return embed;
    }

    try {
      
      switch (refresh) {
        case "files": {
          const embed = await pull(type);
          if (!embed) return;
          client.commands.clear();
          client.prefix.clear();
          client.loadSlashCmd("./src/commands");
          client.loadPrefix("./src/commands/prefix");
          client.loadEvents("./src/events");
          msg.channel.send({ embeds: [embed] });
          break;
        }
        case "bot": {
        msg.channel.send('Done. Now go to sleep')
          break;
        }
         default : {
          const embed = await pull(type);
          client.commands.clear();
          client.prefix.clear();
          client.loadSlashCmd("./src/commands");
          client.loadPrefix("./src/commands/prefix");
          client.loadEvents("./src/events");
          msg.channel.send({ embeds: [embed] });
          break;
       }
      }
    } catch (error) {
      const errorEmb = new EmbedBuilder().setAuthor("☣️ Error").setColor("Red").setDescription(`Error while reloading\n\`\`\`${error}\`\`\``);
      msg.channel.send({ embeds: [errorEmb] });
    }
  },
};

async function consoleRun(type, client) {
  return new Promise((resolve, reject) => {
    exec("git pull", (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }

      
      const regex = /.*Fast-forward\s+([\s\S]*)/g;
      const match = regex.exec(stdout)
      let matched = "";
      if (match && match[1]) {
        matched = match[1].trim().replace('deleted mode', 'deleted').replace('created mode', 'created');
      }
      
      if (stdout.includes("Already up to date.")) {
        resolve('Upto date.');
      } else {
      resolve(
        new EmbedBuilder()
          .setColor("Green")
          .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL()})    
          .setTitle(`Successfully reloaded ${type}.`)
          .setFields({ name: "Files changed", value: `\`\`\`${matched.length > 4096 ? matched.substr(0, 4000) : matched}\`\`\`` })
          .setTimestamp()
      );
      }
    });
  });
}
