const { AttachmentBuilder } = require("discord.js");
const { QuizWinnerCard } = require("@functions");
module.exports = {
  data: {
    name: "test",
    description: "Set a new prefix for this server",
  },
  async execute(message, args) {
    message.reply('Buffalo')
  },
};
