module.exports = {
  data: {
    name: 'z-ping',
    description: "get the bot's ping",
  },
  async execute(interaction) {
    const { client } = interaction;
    interaction.reply(
      `🏓 Message Latency is ${
        Date.now() - interaction.createdTimestamp
      }ms.\n🏓 Websocket Latency is ${Math.round(client.ws.ping)}ms`,
    );
  },
};
