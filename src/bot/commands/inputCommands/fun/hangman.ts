import { Hangman } from "#bot/libs/classes/HangMan";
import type { Command } from "#structures";

export default {
  name: "hangman",
  description: "Hmmm",
  async messageRun({ message, args }) {
    const hangman = new Hangman(message.channel, {
      players: [message.author],
      mode: "single",
      word: args.join(" "),
    });
    hangman.inititalize();
  },
} satisfies Command;
