import { ContextTypes, IntegrationTypes } from "#src/libs/types";
import { SlashCommand } from "#structures";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default <SlashCommand>{
  data: {
    name: "ping",
    description: "Replies with pong!",
    integration_types: [IntegrationTypes.Guilds, IntegrationTypes.Users],
    contexts: [ContextTypes.BotDM, ContextTypes.Guild, ContextTypes.PrivateChannels],
  },
  async execute(interaction, client) {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("ping").setLabel("Refresh").setStyle(ButtonStyle.Primary),
    );
    interaction.reply({ content: "Pong! " + client.ws.ping.toString() + "ms", components: [row] });
  },
};
