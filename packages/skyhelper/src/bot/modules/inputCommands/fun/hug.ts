import type { Command } from "@/structures";
import { HUG_DATA } from "@/modules/commands-data/fun-commands";
import type { APIUser } from "@discordjs/core";
import Utils from "@/utils/classes/Utils";
export default {
  ...HUG_DATA,
  async messageRun({ message, args, client }) {
    const msg = message;
    const user = msg.mentions[0] ?? (await client.api.users.get(args[0]!).catch(() => undefined));
    if (!user) {
      await client.api.channels.createMessage(msg.channel_id, {
        content: "You need to mention someone to hug, you can't exactly hug air, can you?",
      });
      return;
    }
    await client.api.channels.createMessage(message.channel_id, getHugResponse(msg.author, user));
  },
  async interactionRun({ options, helper }) {
    const user = options.getUser("user", true);
    await helper.reply(getHugResponse(helper.user, user));
  },
} satisfies Command;

const getHugResponse = (requester: APIUser, user: APIUser) => {
  return {
    content: `A sky hug for <@${user.id}>`,
    embeds: [
      {
        author: {
          name: `SkyHug for ${user.username}`,
          icon_url: Utils.getUserAvatar(user),
        },
        image: {
          url: "https://cdn.imnaiyar.site/hug.gif",
        },
        footer: {
          text: `From ${requester.username}`,
          icon_url: Utils.getUserAvatar(requester),
        },
      },
    ],
  };
};
