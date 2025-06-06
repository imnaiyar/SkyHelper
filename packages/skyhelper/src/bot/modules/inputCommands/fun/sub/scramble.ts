import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import Utils from "@/utils/classes/Utils";
import type {
  APIActionRowComponent,
  APIEmbed,
  APIUser,
  APIComponentInMessageActionRow,
  APITextChannel,
  APIModalInteractionResponseCallbackData,
} from "@discordjs/core";
import { ComponentType, SelectMenuDefaultValueType, MessageFlags } from "@discordjs/core";
import { updateUserGameStats } from "@/utils/utils";
import { Scrambled, scrambleWord } from "@/utils/classes/Scrambled";
import { container, row, section, separator, textDisplay } from "@skyhelperbot/utils";
import { CustomId } from "@/utils/customId-store";

export async function handleSingleMode(helper: InteractionHelper) {
  const { original, scrambled } = scrambleWord();

  const component = container(
    textDisplay("### SkyGame: Scrambled"),
    separator(),
    textDisplay(`Unscramble this word!\n\n### \`${scrambled}\`\n\n-# You have 1min to answer.`),
    separator(),
    row({
      type: 2,
      style: 3,
      label: "Type the unscrambled word",
      custom_id: Utils.store.serialize(CustomId.Default, { data: "scramble-guess-single", user: helper.user.id }),
    }),
  );

  const message = await helper.editReply({ components: [component], flags: MessageFlags.IsComponentsV2 });

  const response = await helper.client
    .awaitComponent({
      filter: (i) => (i.member?.user || i.user!).id === helper.user.id,
      message,
      timeout: 60_000,
    })
    .catch(() => null);

  const result = `The correct word was \`${original}\`\n-# Scrambled: \`${scrambled}\``;

  const playButton = container(
    component.components
      .toSpliced(
        0,
        1,
        section(
          {
            type: 2,
            label: "Play Again",
            style: 2,
            custom_id: "scramble-play-single",
          },
          `### SkyGame: Scrambled`,
        ),
      )
      .toSpliced(2, 1, textDisplay(`### Timed-out!\n${result}`))
      .toSpliced(-2, 2),
  );
  if (!response) {
    await helper.editReply({
      components: [playButton],
    });
    return;
  }

  const modal: APIModalInteractionResponseCallbackData = {
    title: "SkyGame: Scrambled",
    custom_id: "scramble-guess-modal;" + helper.int.id,
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
  await helper.client.api.interactions.createModal(response.id, response.token, modal);

  const submitted = await helper.client
    .awaitModal({
      timeout: 60_000,
      filter: (i) =>
        i.data.custom_id === "scramble-guess-modal;" + helper.int.id && helper.user.id === (i.member?.user || i.user)!.id,
    })
    .catch(() => null);

  if (!submitted) {
    await helper.editReply({
      components: [playButton],
    });
    return;
  }

  const modalHelper = new InteractionHelper(submitted, helper.client);

  const guessedCorrectly = Utils.getTextInput(submitted, "scramble-correct-word", true).value.trim().toLowerCase() === original;

  await modalHelper.update({
    components: [
      container(
        playButton.components.toSpliced(
          2,
          1,
          textDisplay(`You guessed ${guessedCorrectly ? "correctly ✅" : "incorrectly ❌"}!\n\n${result}`),
        ),
      ),
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
}

const rules = [
  "Each game will have a max no. of rounds that'll be played in total. (default: 10)",
  "During each round, both players are allowed to try to unscramble the given word. Whoever does it first wins that round. (There'll be hints)",
  "After all the rounds has ended, the winner will be decided one who won the most round (or who was the quickest if it was a tie).",
];
export async function handleDoubleMode(helper: InteractionHelper) {
  let players: APIUser[] = [];

  const generateResponse = () => {
    const requirement: Array<string> = [];
    if (players.length < 2) {
      requirement.push("❌️ You need to select at least two players for the game.");
    }

    if (players.some((p) => p.bot)) {
      requirement.push("❌️ Bots cannot be players.");
    }
    const embed: APIEmbed = {
      title: "Skygame: Scrambled",
      description: `**Mode**: Double Mode\n**Players**: ${players.length ? players.map((p) => `<@${p.id}>`).join(", ") : "None Selected"}\n${requirement.length ? `**Requirements**:\n${requirement.join("\n- ")}\n` : ""}\n **Instructions**:\n- ${rules.join("\n- ")}`,
    };
    const isButtonDisabled = players.length < 2 || players.some((p) => p.bot);

    const comps: APIActionRowComponent<APIComponentInMessageActionRow> = {
      type: 1,
      components: [
        {
          type: ComponentType.UserSelect,
          min_values: 2,
          max_values: 2,
          default_values: players.map((p) => ({ id: p.id, type: SelectMenuDefaultValueType.User })),
          custom_id: Utils.store.serialize(CustomId.Default, { data: "player-select", user: helper.user.id }),
          placeholder: "Select Players",
        },
      ],
    };

    return {
      embeds: [embed],
      components: [
        comps,
        {
          type: 1,
          components: [
            {
              type: 2,
              label: "Start",
              style: 3,
              custom_id: Utils.store.serialize(CustomId.Default, { data: "scramble-start", user: helper.user.id }),
              disabled: isButtonDisabled,
            },
          ],
        },
      ],
    };
  };
  const message = await helper.editReply(generateResponse());
  const collector = helper.client.componentCollector({
    idle: 90_000,
    filter: (i) => helper.user.id === (i.member?.user || i.user)!.id,
    message,
  });
  collector.on("collect", async (int) => {
    const compHelper = new InteractionHelper(int, helper.client);
    if (compHelper.isUserSelect(int)) {
      players = [...Object.values(int.data.resolved.users)];
      await compHelper.update(generateResponse());
    }
    if (compHelper.isButton(int)) {
      const scramble = new Scrambled(
        helper.int.channel as APITextChannel,
        {
          players,
          gameInitiator: helper.user,
        },
        helper.client,
      );
      await compHelper.deferUpdate();
      await scramble.initialize();
      helper.client.gameData.set(helper.int.channel!.id, scramble);
    }
  });
}
