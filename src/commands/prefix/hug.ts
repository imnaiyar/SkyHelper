import * as d from "discord.js";
import type { PrefixCommand } from "#structures";
export default {
  data: {
    name: "hug",
    description: "hugs someone",
    aliases: ["skyhug", "hg"],
  },
  async execute({ message, args, client }) {
    const msg = message;
    const user = msg.mentions.users.first() || client.users.cache.get(args[0]);
    if (!user) return void msg.reply("You need to mention someone to hug, you can't exactly hug air, can you?");

    msg.channel.send({
      content: `A sky hug for ${user.toString()}`,
      embeds: [
        new d.EmbedBuilder()
          .setAuthor({
            name: `SkyHug for ${user.username}`,
            iconURL: user.displayAvatarURL(),
          })
          .setImage("https://cdn.imnaiyar.site/hug.gif")
          .setFooter({
            text: `From ${msg.author.username}`,
            iconURL: msg.author.displayAvatarURL(),
          }),
      ],
    });
  },
} satisfies PrefixCommand;
