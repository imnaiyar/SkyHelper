import { SKYTIMES_DATA } from "#bot/commands/commands-data/info-commands";
import { getTimesEmbed } from "#bot/utils/buildEventsEmbed";
import type { Command } from "#structures";
export default {
  async interactionRun(interaction, t, client) {
    await interaction.deferReply({ ephemeral: interaction.options.getBoolean("hide") ?? false });

    await interaction.followUp({ ...(await getTimesEmbed(client, t, t("common:bot.name"))), fetchReply: true });
  },
  async messageRun({ message, t, client }) {
    await message.reply(await getTimesEmbed(client, t, t("common:bot.name")));
  },
  ...SKYTIMES_DATA,
} satisfies Command;
