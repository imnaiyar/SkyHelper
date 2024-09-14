import Guild from "#schemas/guildBlackList";
import { EmbedBuilder, Message, type User } from "discord.js";
import { getUser } from "#schemas/User";
import type { SkyHelper, Command } from "#structures";
export default {
  name: "blacklist",
  description: "blacklist a guild or an user.",
  prefix: {
    aliases: ["bl"],
    minimumArgs: 1,
    usage: "g <id> Doing some shady stuff",
    subcommands: [
      {
        trigger: "g <id> [reason]",
        description: "Adds a guild to blacklist",
      },
      {
        trigger: "rmg <id>",
        description: "Removes a guild from blacklist",
      },
      {
        trigger: "u <id> [reason]",
        description: "Adds a user to blacklist",
      },
      {
        trigger: "rmu <id>",
        description: "Removes a user from blacklist",
      },
      {
        trigger: "glist",
        description: "Lists all blacklisted guilds",
      },
    ],
  },
  validations: [
    {
      message: "ID must be provided with this subcommand",
      callback(msg, messageOptions) {
        if (!(msg instanceof Message) || !messageOptions?.args) return true;
        const sub = messageOptions.args[0];
        if (["g", "rmG", "u", "rmU"].includes(sub) && !messageOptions.args[1]) return false;
        return true;
      },
    },
  ],
  category: "OWNER",
  ownerOnly: true,

  async messageRun({ message, args, client }) {
    const sub = args[0];

    if (args[1] && isNaN(parseInt(args[1]))) {
      return void message.reply("ID must only contain Numbers");
    }
    const ID = args[1];
    switch (sub) {
      case "g":
        await blacklistGuild(client, message, ID);
        break;
      case "rmG":
        await removeGuildBlacklist(client, message, ID);
        break;
      case "u": {
        const user = await client.users.fetch(args[1]);
        await blacklistUser(user, message);
        break;
      }
      case "rmU": {
        const userR = await client.users.fetch(args[1]);
        await removeUserBlacklist(userR, message);
        break;
      }
      case "gList":
        await getBlacklistedGuild(message);
        break;
      default:
        message.reply("invalid usage");
        break;
    }
  },
} satisfies Command;

async function blacklistGuild(client: SkyHelper, message: Message, ID: string) {
  const guild = client.guilds.cache.get(ID);
  const reason = message.content.split(" ").slice(3).join(" ") || "Unknown";
  let guildName;
  let guildId;

  if (guild) {
    guildName = guild.name;
    guildId = guild.id;
  } else {
    guildName = "Unknown";
    guildId = ID;
  }

  let data = await Guild.findOne({ Guild: ID }).catch(() => {});
  if (data) {
    return message.reply(`This server is already blacklisted`);
  }

  data = new Guild({
    Guild: guildId,
    Name: guildName,
    Reason: reason,
    Date: Date.now(),
  });

  await data.save();
  if (guild) {
    await guild.leave();
  }
  return message.reply(`Guild is Blacklisted.
__Guild Details__
- Name: ${guildName}
- ID: ${guildId}
- Reason: ${reason || "Unknown"}`);
}

async function removeGuildBlacklist(client: SkyHelper, message: Message, ID: string) {
  const guild = client.guilds.cache.get(ID);

  let guildId;

  if (guild) {
    guildId = guild.id;
  } else {
    guildId = ID;
  }

  const data = await Guild.findOneAndDelete({ Guild: guildId }).catch(() => {});
  if (!data) {
    return message.reply(`This server is not blacklisted`);
  }
  return message.reply(`Server Unblacklisted`);
}

async function blacklistUser(user: User, message: Message) {
  if (!user) {
    return message.reply("Invalid User ID.");
  }
  const userDb = await getUser(user);
  userDb.isBlacklisted = true;
  await userDb.save();
  return message.reply(`${user.username} is blacklisted.`);
}

async function removeUserBlacklist(user: User, message: Message) {
  if (!user) {
    return message.reply("Invalid User ID.");
  }
  const userDbR = await getUser(user);
  userDbR.isBlacklisted = false;
  await userDbR.save();
  return message.reply(`${user.username} is removed from blacklist.`);
}

async function getBlacklistedGuild(message: Message) {
  const blacklists = await Guild.find();
  const embed = new EmbedBuilder().setAuthor({ name: `Blacklisted Servers` });
  blacklists.forEach((g) => {
    embed.addFields({
      name: `${g.Name}`,
      value: `- ID: ${g.Guild}\n- Reason: ${g.Reason}\n- On: ${g?.Date}`,
    });
  });
  message.reply({ embeds: [embed] });
}
