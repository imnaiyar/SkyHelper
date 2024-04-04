import { EmbedBuilder } from 'discord.js';
import { exec } from 'child_process';
import { recursiveReadDirSync } from '#handler';
import { error } from '#src/logger';

/**
 * @type {import('#src/frameworks').PrefixCommands}
 */
export default {
  data: {
    name: "reload",
    description: "reloads the bot",
    category: "OWNER",
    args: {
      require: true,
      args: ["bot"],
    },
    flags: ["commands", "events", "files", "local", "l"],
    aliases: ["rl"],
  },
  async execute(msg, args, client, flags) {
    const filtered = ["commands", "events", "files"];
    const combinations = [
      { match: ["commands", "events", "files"], result: "Commands and Buttons and Events and Files" },
      { match: ["commands", "files"], result: "Commands and Buttons and Files" },
      { match: ["commands", "events"], result: "Commands and Buttons and Events" },
      { match: ["events", "files"], result: "Events and Files" },
      { match: ["commands"], result: "Commands and Buttons" },
      { match: ["events"], result: "Events" },
      { match: ["files"], result: "Files" },
      { match: [], result: "Commands and Buttons" },
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
      client.loadButtons("src/buttons");
      client.loadSlashCmd("src/commands");
      client.loadPrefix("src/commands/prefix");
    }

    if (flags.includes("events")) {
      client.loadEvents("src/events");
    }

    if (flags.includes("files")) {
      clearCache("src/functions");
      clearCache("src/handler");
      clearCache("src/frameworks");
      clearCache("src/commands");
      clearCache("src/commands/prefix");
      clearCache("src/buttons");
      clearCache("src/libs");
      clearCache("src/extenders");
    }

    if (filtered.every((item) => !flags.includes(item))) {
      client.loadButtons("./src/buttons");
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

function clearCache(directory) {
  recursiveReadDirSync(directory).forEach((filePath) => {
    const file = require("path").basename(filePath);
    try {
      delete require.cache[require.resolve(filePath)];
    } catch (err) {
      error(`Failed to reload ${file}`);
    }
  });
}
