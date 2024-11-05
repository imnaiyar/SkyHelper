import type { SpiritsData } from "#libs/constants/spirits-datas/type";
import { Spirits } from "#libs/classes/Spirits";
import type { Command } from "#structures";
import { SPIRTIS_DATA } from "#bot/commands/commands-data/guide-commands";
export default {
  async interactionRun(interaction, t, client) {
    await interaction.deferReply({ ephemeral: interaction.options.getBoolean("hide") || false });
    const value = interaction.options.getString("search");
    const data = client.spiritsData[value as keyof typeof client.spiritsData] as SpiritsData;

    if (!data) {
      // prettier-ignore
      await interaction.editReply(
        t("commands:SPIRITS.RESPONSES.NO_DATA", {
          VALUE: value,
          COMMAND: `</utils contact-us:${client.application.commands.cache.find((c) => c.name === "utils")!.id}>`,
        }),
      );
      return;
    }
    const manager = new Spirits(data, t, client);
    const btns = manager.getButtons();
    await interaction.followUp({
      embeds: [manager.getEmbed()],
      ...(btns.components?.length && { components: [btns] }),
    });
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
  ...SPIRTIS_DATA,
} satisfies Command<true>;
