import * as d from "discord.js";
import type { Command } from "#structures";
export default {
  name: "hug",
  description: "hugs someone",
  prefix: {
    aliases: ["skyhug"],
    minimumArgs: 1,
    usage: "<ID|mention>",
  },
  async messageRun({ message, args, client }) {
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
} satisfies Command;
