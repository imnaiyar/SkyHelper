import * as d from "discord.js";
import type { Command } from "#structures";
import { HUG_DATA } from "#bot/commands/commands-data/fun-commands";
export default {
  ...HUG_DATA,
  async messageRun({ message, args, client }) {
    const msg = message;
    const user = msg.mentions.users.first() || (await client.users.fetch(args[0]).catch(() => undefined));
    if (!user) return void msg.reply("You need to mention someone to hug, you can't exactly hug air, can you?");
    await msg.reply(getHugResponse(msg.author, user));
  },
  async interactionRun(interaction) {
    const user = interaction.options.getUser("user", true);
    await interaction.reply(getHugResponse(interaction.user, user));
  },
} satisfies Command;

const getHugResponse = (requester: d.User, user: d.User): d.BaseMessageOptions => {
  return {
    content: `A sky hug for ${user.toString()}`,
    embeds: [
      new d.EmbedBuilder()
        .setAuthor({
          name: `SkyHug for ${user.username}`,
          iconURL: user.displayAvatarURL(),
        })
        .setImage("https://cdn.imnaiyar.site/hug.gif")
        .setFooter({
          text: `From ${requester.username}`,
          iconURL: requester.displayAvatarURL(),
        }),
    ],
  };
};
