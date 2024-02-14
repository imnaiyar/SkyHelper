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
    flags: ["bot", "commands", "files"],
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
        case "commands": {
          const embed = await pull(type);
          client.commands.clear();
          client.prefix.clear();
          client.loadSlashCmd("./src/commands");
          client.loadPrefix("./src/commands/prefix");
          if (!embed) return;
          msg.channel.send({ embeds: [embed] });
          break;
        }
        case "bot": {
        msg.channel.send('Done. Now go to sleep')
          break;
        }
        case 'files': {
          msg.channel.send('Starting total cache sweep...')
          const functions = path.resolve(__dirname, '../../functions');
          const handler = path.resolve(__dirname, '../../handler');
          const events = path.resolve(__dirname, '../../events');
          clearCache(functions);
          clearCache(handler);
          client.commands.clear();
          client.prefix.clear();
          client.loadSlashCmd("./src/commands");
          client.loadPrefix("./src/commands/prefix");
          client.loadEvents('./src/events');
          msg.channel.send('success');
          break;
        }
         default : {
          const embed = await pull(type);
          client.commands.clear();
          client.prefix.clear();
          client.loadSlashCmd("./src/commands");
          client.loadPrefix("./src/commands/prefix");
          client.loadEvents("./src/events");
          if (!embed) return;
          msg.channel.send({ embeds: [embed] });
          break;
       }
      }
    } catch (error) {
      const errorEmb = new EmbedBuilder().setAuthor({ name: "☣️ Error"}).setColor("Red").setDescription(`Error while reloading\n\`\`\`bash\n${error}\`\`\``);
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
          .setFields({ name: "Files changed", value: `\`\`\`bash\n${matched.length > 4096 ? matched.substr(0, 4000) : matched}\`\`\`` })
          .setTimestamp()
      );
      }
    });
  });
}
const fs = require('fs');
const path = require('path');

function clearCache(directory) {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const filePath = path.join(directory, file);

    if (fs.statSync(filePath).isDirectory()) {
      // Recursively clear cache for subdirectories
      clearCache(filePath);
    } else {
      // Delete cache for each file
      delete require.cache[require.resolve(filePath)];
    }
  });
}

