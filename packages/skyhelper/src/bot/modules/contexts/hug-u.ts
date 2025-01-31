import type { ContextMenuCommand } from "@/structures";
import { ApplicationCommandType } from "@discordjs/core";

export default {
  name: "Hug",
  data: {
    type: ApplicationCommandType.User,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  category: "Fun",
  async execute(_int, helper, _t, options) {
    const user = options.getTargetUser();
    await helper.reply({
      content: `A sky hug for <@${user.id}>`,
      embeds: [
        {
          author: {
            name: `SkyHug for ${user.username}`,
            icon_url: helper.client.utils.getUserAvatar(user),
          },
          image: {
            url: "https://cdn.imnaiyar.site/hug.gif",
          },
          footer: {
            text: `From ${helper.user.username}`,
            icon_url: helper.client.utils.getUserAvatar(helper.user),
          },
        },
      ],
    });
  },
} satisfies ContextMenuCommand<"UserContext">;
