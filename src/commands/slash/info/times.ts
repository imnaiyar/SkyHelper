import { getEventEmbed } from "#handlers/getDailyEventTimes";
import type { SlashCommand } from "#structures";
import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import "moment-duration-format";

export default {
  data: {
    name: "skytimes",
    description: "various in-game events countdown",
    options: [
      {
        name: "hide",
        description: "hides the response",
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  category: "Info",
  cooldown: 20,
  async execute(interaction, _t, client) {
    await interaction.deferReply({ ephemeral: interaction.options.getBoolean("hide") ?? false });

    const embed = await getEventEmbed(client);
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("skytimes-details")
        .setPlaceholder("Detailed Times")
        .addOptions([
          {
            label: "Geyser",
            value: `geyser`,
          },
          {
            label: "Grandma",
            value: `grandma`,
          },
          {
            label: "Turtle",
            value: `turtle`,
          },
        ]),
    );
    const btn = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("times-refresh").setEmoji("🔃").setStyle(ButtonStyle.Primary),
    );
    await interaction.followUp({ embeds: [embed], components: [row, btn], fetchReply: true });
  },
} satisfies SlashCommand;
