import { getTimesEmbed } from "#bot/handlers/buildEventsEmbed";
import { useTranslations as x } from "#handlers/useTranslation";
import type { SlashCommand } from "#structures";
import { ApplicationCommandOptionType } from "discord.js";
export default {
  async execute(interaction, t, client) {
    await interaction.deferReply({ ephemeral: interaction.options.getBoolean("hide") ?? false });

    await interaction.followUp({ ...(await getTimesEmbed(client, t, t("common.bot.name"))), fetchReply: true });
  },
  data: {
    name: "skytimes",
    name_localizations: x("commands.SKYTIMES.name"),
    description: "various in-game events countdown",
    description_localizations: x("commands.SKYTIMES.description"),
    options: [
      {
        name: "hide",
        name_localizations: x("common.hide-options.name"),
        description: "hides the response",
        description_localizations: x("common.hide-options.description"),
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  category: "Info",
  cooldown: 20,
} satisfies SlashCommand;
