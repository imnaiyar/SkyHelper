import { getTimesEmbed } from "#handlers/getDailyEventTimes";
import { useTranslations as x } from "#handlers/useTranslation";
import type { SlashCommand } from "#structures";
import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import "moment-duration-format";
export default {
  async execute(interaction, t, client) {
    await interaction.deferReply({ ephemeral: interaction.options.getBoolean("hide") ?? false });

    const embed = await getTimesEmbed(client, t, t("common.bot.name"));
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("skytimes-details")
        .setPlaceholder(t("commands.SKYTIMES.RESPONSES.SELECT_PLACEHOLDER"))
        .addOptions([
          {
            label: t("times-embed.GEYSER"),
            value: `geyser`,
          },
          {
            label: t("times-embed.GRANDMA"),
            value: `grandma`,
          },
          {
            label: t("times-embed.TURTLE"),
            value: `turtle`,
          },
        ]),
    );
    const btn = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("times-refresh").setEmoji("🔃").setStyle(ButtonStyle.Primary),
    );
    await interaction.followUp({ embeds: [embed], components: [row, btn], fetchReply: true });
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
