import type { SlashCommand } from "#src/structures/SlashCommands";

export default {
  async execute(interaction, client, t) {
    interaction.reply(t("commands.ping", { latency: client.ws.ping }));
  },
  data: {
    name: "ping",
    description: "pongs",
  },
} satisfies SlashCommand;
