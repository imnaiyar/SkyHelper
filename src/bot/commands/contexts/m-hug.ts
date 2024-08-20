import type { ContextMenuCommand } from "#structures";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

export default {
  data: {
    name: "Hug",
    type: ApplicationCommandType.Message,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  async execute(interaction) {
    const user = interaction.targetMessage.author;
    await interaction.reply({
      content: `A sky hug for ${user.toString()}`,
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `SkyHug for ${user.username}`,
            iconURL: user.displayAvatarURL(),
          })
          .setImage("https://cdn.imnaiyar.site/hug.gif")
          .setFooter({
            text: `From ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          }),
      ],
    });
  },
} satisfies ContextMenuCommand<"MessageContext">;
