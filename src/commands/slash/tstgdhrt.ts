import { SlashCommand } from "#src/structures/SlashCommands";

export default {
  data: {
    name: "test",
    description: "test stuff",
  },
  ownerOnly: true,
  skipDeploy: true,

  async execute(interaction, _t, _client) {
    // Intentional error to check sentry logging
    await interaction.reply("");
  },
} satisfies SlashCommand;
