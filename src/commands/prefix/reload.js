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
    flags: ["commands", "events"],
  },
  async execute(msg, args, client, flags) {
    const type = args[0] === 'bot' ? 'Bot' : (this.data.flags.every(flag => flags.includes(flag)) ? 'Commands and Events' : flags[0] === 'commands' ? 'Commands' : flags[0] === 'events' ? 'Events' : 'Commands and Events');
    msg.channel.send({
      embeds: [
        new EmbedBuilder()
        .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL()})
        .setTitle('Reload')
        .setDescription(`Reloading ${type}`)
        ]
    });
    if (args[0]) {
        return msg.channel.send('Done. Now go to sleep')
    }

    const refresh = this.data.flags.every(flag => flags.includes(flag)) ? 'both' : flags[0]

    const pull = async () => {
        const embed = await consoleRun(type);
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
          if (!embed) return;
          client.commands.clear();
          client.prefix.clear();
          client.loadSlashCmd("./src/commands");
          client.loadPrefix("./src/commands/prefix");
          msg.channel.send({ embeds: [embed] });
          break;
        }
        case "events": {
          const embed = await pull(type);
          if (!embed) return;
          client.loadEvents("./src/events");
          msg.channel.send({ embeds: [embed] });
          break;
        }
       case 'both': {
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
      }
    } catch (error) {
      const errorEmb = new EmbedBuilder().setAuthor("☣️ Error").setColor("Red").setDescription(`Error while reloading\n\`\`\`${error}\`\`\``);
      msg.channel.send({ embeds: [errorEmb] });
    }
  },
};

async function consoleRun(type) {
  return new Promise((resolve, reject) => {
    exec("git pull", (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }

      
      const regex = /\s+(\S+\s+\|\s+\d+\s[+-]+)\n/g;
      const matches = stdout.match(regex);
      let matched = "";
      if (matches) {
        matches.forEach((match) => (matched += `${match}\n`));
      }
      
      if (stdout.includes("Already up to date.")) {
        resolve('Upto date.');
      } else {
      resolve(
        new EmbedBuilder()
          .setColor("Green")
          .setDescription(`Successfully reloaded ${type}.`)
          .setFields({ name: "Files changed", value: matched.length > 4096 ? matched.substr(0, 4000) : matched })
          .setTimestamp()
      );
      }
    });
  });
}
