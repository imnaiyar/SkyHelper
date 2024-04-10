import { ContextTypes, IntegrationTypes } from "#src/libs/types";
import { ContextMenuCommand } from "#structures";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

export default <ContextMenuCommand<"UserContext">>{
  data: {
    name: "Avatar",
    type: ApplicationCommandType.User,
    integration_types: [IntegrationTypes.Guilds, IntegrationTypes.Users],
    contexts: [ContextTypes.BotDM, ContextTypes.Guild, ContextTypes.PrivateChannels],
  },
  async execute(interaction, client) {
    const user = interaction.targetUser;
    const embed = new EmbedBuilder()
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setAuthor({ name: user.username + "Avatar", iconURL: client.user.displayAvatarURL() })
      .setImage(user.displayAvatarURL({ size: 2048 }));
    await interaction.reply({ embeds: [embed] });
  },
};
