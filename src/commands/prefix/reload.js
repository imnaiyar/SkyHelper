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
      args: ["bot"],
    },
    flags: ["commands", "events", "files", "local", "l"],
  },
  async execute(msg, args, client, flags) {
    const filtered = ["commands", "events", "files"];
    const combinations = [
      { match: ["commands", "events", "files"], result: "Commands and Events and Files" },
      { match: ["commands", "files"], result: "Commands and Files" },
      { match: ["commands", "events"], result: "Commands and Events" },
      { match: ["events", "files"], result: "Events and Files" },
      { match: ["commands"], result: "Commands" },
      { match: ["events"], result: "Events" },
      { match: ["files"], result: "Files" },
      { match: [], result: "Commands" },
    ];
    const matchingCombination =
      combinations.find((combination) => combination.match.every((flag) => flags.includes(flag))) ||
      combinations[combinations.length - 1];
    const type = matchingCombination.result;
    if (args[0] === "bot") {
      await msg.reply("later");
    }
    msg.channel.send({
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
          .setTitle("Reload")
          .setDescription(`Reloading ${type}`),
      ],
    });
    let embed = new EmbedBuilder()
      .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
      .setTimestamp();
    if (!flags.includes("local") && !flags.includes("l")) {
      const data = await consoleRun(type, client);
      if (data === "Upto date.") {
        embed
          .setTitle("Upto date")
          .setDescription(`Local branch is already upto date with remote branch, nothing to update`);
        msg.channel.send({ embeds: [embed] });
        return;
      }
      embed = data;
    } else {
      embed.setDescription(`Reloaded ${type}`);
    }

    if (flags.includes("commands")) {
      const commands = path.resolve(__dirname, "../../commands");
      clearCache(commands);
      client.commands.clear();
      client.prefix.clear();
      client.loadSlashCmd("./src/commands");
      client.loadPrefix("./src/commands/prefix");
    }

    if (flags.includes("events")) {
      client.loadEvents("./src/events");
    }

    if (flags.includes("files")) {
      const functions = path.resolve(__dirname, "../../functions");
      const handler = path.resolve(__dirname, "../../handler");

      clearCache(functions);
      clearCache(handler);
    }

    if (filtered.every((item) => !flags.includes(item))) {
      client.commands.clear();
      client.prefix.clear();
      client.loadSlashCmd("./src/commands");
      client.loadPrefix("./src/commands/prefix");
    }

    await msg.channel.send({ embeds: [embed] });
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
      const match = regex.exec(stdout);
      let matched = "";
      if (match && match[1]) {
        matched = match[1].trim().replace("deleted mode", "deleted").replace("created mode", "created");
      }

      if (stdout.includes("Already up to date.")) {
        resolve("Upto date.");
      } else {
        resolve(
          new EmbedBuilder()
            .setColor("Green")
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .setTitle(`Successfully reloaded ${type}.`)
            .setFields({
              name: "Files changed",
              value: `\`\`\`bash\n${matched.length > 4096 ? matched.substr(0, 4000) : matched}\`\`\``,
            })
            .setTimestamp(),
        );
      }
    });
  });
}
const fs = require("fs");
const path = require("path");

function clearCache(directory) {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const filePath = path.join(directory, file);

    if (fs.statSync(filePath).isDirectory()) {
      clearCache(filePath);
    } else {
      delete require.cache[require.resolve(filePath)];
    }
  });
}
