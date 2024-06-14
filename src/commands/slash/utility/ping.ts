import type { SlashCommand } from "#src/structures/SlashCommands";

export default {
  async execute(interaction, t) {
    interaction.reply(t("commands.ping", { latency: interaction.client.ws.ping }));
  },
  data: {
    name: "ping",
    description: "pongs",
  },
} satisfies SlashCommand;
