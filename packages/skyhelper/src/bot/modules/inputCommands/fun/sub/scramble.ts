import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import Utils from "@/utils/classes/Utils";
import type {
  APIActionRowComponent,
  APIButtonComponent,
  APIEmbed,
  APIUser,
  APIMessageActionRowComponent,
  APITextChannel,
} from "@discordjs/core";
import { ComponentType, SelectMenuDefaultValueType } from "@discordjs/core";
import { hangmanWords } from "@skyhelperbot/constants";
import { Scrambled, scrambleWord } from "@/utils/classes/Scrambled";

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

    const comps: APIActionRowComponent<APIMessageActionRowComponent> = {
      type: 1,
      components: [
        {
          type: ComponentType.UserSelect,
          min_values: 2,
          max_values: 2,
          default_values: players.map((p) => ({ id: p.id, type: SelectMenuDefaultValueType.User })),
          custom_id: "scrambled_players_select;user:" + helper.user.id,
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
              custom_id: "scrambled_start;user:" + helper.user.id,
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
