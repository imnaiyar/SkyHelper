import Blacklist from "@/schemas/BlackList";
import type { SkyHelper, Command } from "@/structures";
import { BLACKLIST_DATA } from "@/modules/commands-data/owner-commands";
import type { APIEmbed, APIMessage } from "@discordjs/core";
export default {
  ...BLACKLIST_DATA,

  async messageRun({ message, args, client }) {
    const sub = args[0];

    if (args[1] && isNaN(parseInt(args[1]))) {
      return void (await client.api.channels.createMessage(message.channel_id, {
        content: "ID must only contain Numbers",
      }));
    }
    const ID = args[1];
    switch (sub) {
      case "g":
        await blacklist(client, message, ID, "guild");
        break;
      case "rmG":
        await removeBlacklist(client, message, ID, "guild");
        break;
      case "u": {
        const user = await client.api.users.get(args[1]);
        await blacklist(client, message, user.id, "user");
        break;
      }
      case "rmU": {
        const userR = await client.api.users.get(args[1]);
        await removeBlacklist(client, message, userR.id, "user");
        break;
      }
      case "gList":
        await getBlacklisted(client, message);
        break;
      default:
        await client.api.channels.createMessage(message.channel_id, {
          content: "invalid usage",
        });
        break;
    }
  },
} satisfies Command;

async function blacklist(client: SkyHelper, message: APIMessage, ID: string, type: "guild" | "user") {
  const guild = client.guilds.get(ID);
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

  let data = await Blacklist.findById(ID).catch(() => {});
  if (data) {
    return void (await client.api.channels.createMessage(message.channel_id, {
      content: "This server is already blacklisted",
    }));
  }
  const user = type === "user" ? await client.api.users.get(ID) : null;
  if (user) {
    const userDb = await client.schemas.getUser(user);
    userDb.isBlacklisted = true;
    await userDb.save();
  }
  data = new Blacklist({
    _id: ID,
    type: type,
    name: type === "guild" ? guildName || "unknown" : user?.username,
    reason: reason,
    Date: Date.now(),
  });

  await data.save();
  if (guild) {
    await client.api.users.leaveGuild(guildId);
  }
  return await client.api.channels.createMessage(message.channel_id, {
    content: `Blacklisted.
__Details__
- Name: ${type === "guild" ? guildName || "unknown" : user?.username}
- ID: ${ID},
- Type: ${type}
- Reason: ${reason || "Unknown"}`,
  });
}

async function removeBlacklist(client: SkyHelper, message: APIMessage, ID: string, type: "guild" | "user") {
  const data = await Blacklist.findOneAndDelete({ _id: ID }).catch(() => {});
  if (!data) {
    return void (await client.api.channels.createMessage(message.channel_id, {
      content: `This ${type}  is not blacklisted`,
    }));
  }
  if (type === "user") {
    const user = await client.api.users.get(ID);
    const userDb = await client.schemas.getUser(user);
    userDb.isBlacklisted = false;
    await userDb.save();
  }
  return await client.api.channels.createMessage(message.channel_id, {
    content: `Removed ${type} from blacklist.`,
  });
}

async function getBlacklisted(client: SkyHelper, message: APIMessage) {
  const blacklists = await Blacklist.find();
  const embed: APIEmbed = {
    author: { name: "Blacklisted Servers" },
    fields: blacklists.map((g) => ({
      name: g.name ?? "Hmm",
      value: `- ID: ${g._id}\n- Reason: ${g.reason}\n- On: ${g?.Date}\n- Type: ${g.type}`,
    })),
  };
  return await client.api.channels.createMessage(message.channel_id, {
    embeds: [embed],
  });
}
