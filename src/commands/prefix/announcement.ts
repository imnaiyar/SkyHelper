import { PrefixCommand } from "#structures";
export default {
  data: {
    name: "announce",
    description: "announce new release/updates to the subscribed channels",
    aliases: ["an"],
    category: "OWNER"
  },
  async execute({ message, client, args }) {
    const data = await client.database.getAnnouncementGuilds();
    for (const guild of data) {
      const channel = client.channels.cache.get(guild.annoucement_channel!)
      if (!channel) continue;
      if (!channel.isTextBased()) continue;
      await channel.send(args.join(" "))
    }
    message.reply("Announcement Sent")
  }
} satisfies PrefixCommand;