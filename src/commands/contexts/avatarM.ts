import { ContextTypes, IntegrationTypes } from "#libs/types";
import { ContextMenuCommand } from "#structures";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

export default {
  data: {
    name: "Avatar",
    type: ApplicationCommandType.Message,
    integration_types: [IntegrationTypes.Guilds, IntegrationTypes.Users],
    contexts: [ContextTypes.BotDM, ContextTypes.Guild, ContextTypes.PrivateChannels],
  },
  async execute(interaction, client) {
    const user = interaction.targetMessage.author;
    const embed = new EmbedBuilder()
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setAuthor({ name: user.username + "Avatar", iconURL: client.user.displayAvatarURL() })
      .setImage(user.displayAvatarURL({ size: 2048 }));
    await interaction.reply({ embeds: [embed] });
  },
} satisfies ContextMenuCommand<"MessageContext">;
