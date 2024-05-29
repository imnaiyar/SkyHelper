import type { Button } from "#structures";

export default {
  data: {
    name: "ping",
  },
  async execute(interaction, client) {
    await interaction.update({ content: "Pong! " + client.ws.ping.toString() + "ms" });
  },
} satisfies Button;
