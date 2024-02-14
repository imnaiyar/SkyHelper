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
    args: ["events", "commands"],
    flags: ["both"],
  },
  async execute(message, args, client, flags) {
    const type = args[0] === 'bot' ? 'Bot' : (flags.includes(this.data.flags) ? 'Commands and Events' : flags[0] === 'commands' ? 'Commands' : flags[0] === 'events' ? 'Events' : 'Commands and Events');
    message.channel.send({
      embeds: [
        new EmbedBuilder()
        .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL()})
        .setTitle('Reload')
        .setDescription(`Reloading ${type}`)
        ]
    });
    return;
    try {
      const output = await consoleRun();

      if (flags.length > 0 && flags.includes("both")) {
        client.commands.clear();
        client.prefix.clear();
        client.loadSlashCmd("./src/commands");
        client.loadPrefix("./src/commands/prefix");
        client.loadEvents("./src/events");
        return message.channel.send({ embeds: [success] });
      }

      switch (args[0]) {
        case "commands": {
          client.commands.clear();
          client.prefix.clear();
          client.loadSlashCmd("./src/commands");
          client.loadPrefix("./src/commands/prefix");
          message.channel.send({ embeds: [success] });
          break;
        }
        case "events": {
          client.loadEvents("./src/events");
          message.channel.send({ embeds: [success] });
          break;
        }
        default:
          message.reply(`Invalid args, please provide one of the args [${this.data.args}]`);
      }
    } catch (error) {
      const errorEmb = new EmbedBuilder().setAuthor("☣️ Error").setColor("Red").setDescription(error);
      message.channel.send({ embeds: [errorEmb] });
    }
  },
};

async function consoleRun() {
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
      resolve(
        new EmbedBuilder()
          .setColor("Green")
          .setDescription(`Successfully reloaded ${args[0] ? args[0] : "both commands and events"}.`)
          .setFields({ name: "Files changed", value: matched.lenght > 4096 ? match.substr(0, 4000) : matched })
          .setTimestamp()
      );
    });
  });
}
