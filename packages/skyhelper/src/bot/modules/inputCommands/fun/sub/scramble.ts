import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import Utils from "@/utils/classes/Utils";
import type { APIActionRowComponent, APIButtonComponent, APIEmbed } from "@discordjs/core";
import { hangmanWords } from "@skyhelperbot/constants";

export async function handleSingleMode(helper: InteractionHelper) {
  const { original, scrambled } = scrambleWord();

  const embed: APIEmbed = {
    title: "SkyGame: Scrambled",
    description: `Unscramble this word!\n\n### \`${scrambled}\``,
  };
  const button: APIActionRowComponent<APIButtonComponent> = {
    type: 1,
    components: [
      {
        type: 2,
        style: 3,
        label: "Type the unscrabled word",
        custom_id: Utils.encodeCustomId({ id: "scramble-guess-single", original, scrambled, user: helper.user.id }),
      },
    ],
  };
  await helper.editReply({ embeds: [embed], components: [button] });
}

function scrambleWord() {
  const word = hangmanWords.random().toLowerCase();

  // Split by spaces to handle multi-word phrases
  const words = word.split(" ");

  // Scramble each word individually
  const scrambledWords = words.map((singleWord) => {
    if (singleWord.length <= 2) return singleWord; // no need to scramble short words

    const letters = singleWord.split("");

    // shuffle
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }

    return letters.join("");
  });

  return {
    original: word,
    scrambled: scrambledWords.join(" "),
  };
}
