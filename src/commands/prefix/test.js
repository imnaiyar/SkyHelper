const { AttachmentBuilder } = require("discord.js");
const { QuizWinnerCard } = require("@functions");
module.exports = {
  data: {
    name: "test2",
    description: "Set a new prefix for this server",
  },
  async execute(message, args) {
    const card = new QuizWinnerCard(message.member, "5", "10", message.client);

    const cardBuffer = await card.build();
    const attachment = new AttachmentBuilder(cardBuffer, { name: "winner.png" });
    message.reply({
      content: "Okay, Like This!",
      files: [attachment],
    });
  },
};
