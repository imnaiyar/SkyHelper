import { Button } from "#structures";

export default <Button>{
  data: {
    name: "ping",
  },
  async execute(interaction, client) {
    await interaction.update({ content: "Pong! " + client.ws.ping.toString() + "ms" });
  },
};
