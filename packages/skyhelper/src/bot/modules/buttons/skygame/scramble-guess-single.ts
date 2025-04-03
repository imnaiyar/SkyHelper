import type { Button } from "@/structures";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import Utils from "@/utils/classes/Utils";
import { updateUserGameStats } from "@/utils/utils";
import { ComponentType, MessageFlags, type APIEmbed, type APIModalInteractionResponseCallbackData } from "@discordjs/core";

export default {
  data: {
    name: "scramble-guess-single",
  },
  async execute(interaction, _t, helper, { original, scrambled }) {
    const modal: APIModalInteractionResponseCallbackData = {
      title: "SkyGame: Scrambled",
      custom_id: "scramble-guess-modal;" + interaction.id,
      components: [
        {
          type: 1,
          components: [
            {
              type: ComponentType.TextInput,
              custom_id: "scramble-correct-word",
              placeholder: "Type the unscrambled word",
              label: "The unscrambled word",
              style: 1,
              required: true,
            },
          ],
        },
      ],
    };
    await helper.launchModal(modal);

    const submitted = await helper.client
      .awaitModal({
        timeout: 2 * 60_000,
        filter: (i) =>
          i.data.custom_id === "scramble-guess-modal;" + interaction.id && helper.user.id === (i.member?.user || i.user)!.id,
      })
      .catch(() => null);

    if (!submitted) return;

    const modalHelper = new InteractionHelper(submitted, helper.client);
    const guessedCorrectly = Utils.getTextInput(submitted, "scramble-correct-word", true).value.trim().toLowerCase() === original;
    const embed: APIEmbed = {
      title: "SkyGame: Scrambled",
      description: `You guessed ${guessedCorrectly ? "correctly ✅" : "incorrectly ❌"}!\n\nThe correct word was \`${original}\`\n-# Scrambled: \`${scrambled}\``,
    };
    await modalHelper.update({
      embeds: [embed],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              label: "Play Again",
              style: 2,
              custom_id: "scramble-play-single",
            },
          ],
        },
      ],
    });

    if (guessedCorrectly) {
      await modalHelper.followUp({ content: "You guessed correctly! 🎉", flags: MessageFlags.Ephemeral });
    } else {
      await modalHelper.followUp({
        content: `You guessed incorrectly! 😢\n The correct word was \`${original}\``,
        flags: MessageFlags.Ephemeral,
      });
    }

    // update stats
    await updateUserGameStats(helper.user, "scrambled", "singleMode", guessedCorrectly);
  },
} satisfies Button<{ original: string; scrambled: string }>;
