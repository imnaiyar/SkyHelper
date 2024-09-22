import { Hangman } from "#bot/libs/classes/HangMan";
import type { Command } from "#structures";

export default {
  name: "hangman",
  description: "Hmmm",
  async messageRun({ message, args }) {
    const part = message.mentions.users.first()!;
    const hangman = new Hangman(message.channel, {
      players: [message.author, part],
      mode: "double",
      word: args.slice(1).join(" "),
    });
    hangman.inititalize();
  },
} satisfies Command;
