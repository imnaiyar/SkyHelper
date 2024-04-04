import { AttachmentBuilder } from 'discord.js';
import { QuizWinnerCard } from '@functions';

export default {
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
