import { ContextTypes, IntegrationTypes, type SpiritsData } from "#libs/types";
import { Spirits } from "#libs/classes/Spirits";
import type { SlashCommand } from "#structures";
import { ApplicationCommandOptionType } from "discord.js";

export default {
  data: {
    name: "spirits",
    description: "search for spirits",
    options: [
      {
        name: "search",
        type: ApplicationCommandOptionType.String,
        autocomplete: true,
        description: "search for a spirit",
        required: true,
      },
      {
        name: "hide",
        type: ApplicationCommandOptionType.Boolean,
        description: "Hide the response",
        required: false,
      },
    ],
    integration_types: [IntegrationTypes.Guilds, IntegrationTypes.Users],
    contexts: [ContextTypes.BotDM, ContextTypes.Guild, ContextTypes.PrivateChannels],
  },
  cooldown: 5,
  category: "Guides",
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: interaction.options.getBoolean("hide") || false });
    const value = interaction.options.getString("search");
    const data = client.spiritsData[value as keyof typeof client.spiritsData] as SpiritsData;

    if (!data) {
      // prettier-ignore
      await interaction.editReply(`No data found for ${value}! If you think this is an error, please let us know via </utils contact-us:${client.application.commands.cache.find((c) => c.name === "utils")!.id}>`);
      return;
    }
    const manager = new Spirits(data, client);
    await interaction.followUp({ embeds: [manager.getEmbed()], components: [manager.getButtons()] });
    manager.handleInt(interaction).catch((err) => client.logger.error(err));
  },

  async autocomplete(interaction, client) {
    const value = interaction.options.getFocused();
    const data = Object.entries(client.spiritsData)
      .filter(([, v]) => v.name.toLowerCase().includes(value.toLowerCase()))
      .map(([k, v]) => ({
        name: `↪️ ${v.name}`,
        value: k,
      }));
    await interaction.respond(data.slice(0, 25));
  },
} satisfies SlashCommand<true>;
