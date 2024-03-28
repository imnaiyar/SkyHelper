const askQuestion = require("../functions/quiz/guessing");

module.exports = {
  name: "play-again",
  async execute(interaction, client) {
    if (!interaction.channel.permissionsFor(interaction.guild.members.me).has(["SendMessages", "ViewChannel"])) {
      return interaction.reply({
        content: "I need `View Channel/Send Message` permissions in this channel for the command to work",
        ephemeral: true,
      });
    }

    if (client.gameData.get(interaction.channel.id)) {
      return interaction.reply({
        content: "There's already a game in progress in this channel",
        ephemeral: true,
      });
    }
    await interaction.deferUpdate();
    const total = interaction.customId.split("_")[1];
    await askQuestion(interaction, total);
  },
};
