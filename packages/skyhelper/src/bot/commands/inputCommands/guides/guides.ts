import { seasonsData } from "#libs/index";
import type { Command } from "#structures";
import { handleSeasional } from "./sub/handleSeasional.js";
import { handleRealms } from "./sub/handleRealms.js";
import { GUIDES_DATA } from "#bot/commands/commands-data/guide-commands";
export default {
  async interactionRun(interaction, t) {
    const sub = interaction.options.getSubcommand();
    await interaction.deferReply({ ephemeral: interaction.options.getBoolean("hide") ?? false });
    switch (sub) {
      case "seasonal": {
        await handleSeasional(interaction, t);
        break;
      }
      case "realms": {
        await handleRealms(interaction);
        break;
      }
    }
  },
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused(true);
    const sub = interaction.options.getSubcommand();

    if (sub === "seasonal" && focusedValue.name === "season") {
      // EmojisMap contain all the season name, so get it from there
      const choices = Object.entries(seasonsData).filter(([, v]) =>
        v.name.toLowerCase().includes(focusedValue.value.toLowerCase()),
      );
      await interaction.respond(
        choices.map(([k, v]) => ({
          name: `↪️ Season of ${v.name}`,
          value: k.toString(),
        })),
      );
    }
  },
  ...GUIDES_DATA,
} satisfies Command<true>;
