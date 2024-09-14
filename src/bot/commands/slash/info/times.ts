import { getTimesEmbed } from "#bot/utils/buildEventsEmbed";
import { useTranslations as x } from "#handlers/useTranslation";
import type { Command } from "#structures";
import { ApplicationCommandOptionType } from "discord.js";
export default {
  async interactionRun(interaction, t, client) {
    await interaction.deferReply({ ephemeral: interaction.options.getBoolean("hide") ?? false });

    await interaction.followUp({ ...(await getTimesEmbed(client, t, t("common.bot.name"))), fetchReply: true });
  },
  name: "skytimes",
  description: "various in-game events countdown",
  slash: {
    name_localizations: x("commands.SKYTIMES.name"),
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
} satisfies Command;
