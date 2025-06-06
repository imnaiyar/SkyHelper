import { Hangman } from "@/utils/classes/Hangman";
import type { getTranslator } from "@/i18n";

import { LeaderboardCard, parsePerms, type Permission, type userData } from "@skyhelperbot/utils";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
import {
  ButtonStyle,
  MessageFlags,
  SelectMenuDefaultValueType,
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIContainerComponent,
  type APIGuild,
  type APIGuildMember,
  type APIComponentInMessageActionRow,
  type APIModalInteractionResponseCallbackData,
  type APITextChannel,
  type APIUser,
  type RESTPostAPIChannelMessageJSONBody,
} from "@discordjs/core";
import type { RawFile } from "@discordjs/rest";
import type { SkyGameStatsData } from "@/types/custom";
import { emojis } from "@skyhelperbot/constants";
import { container, mediaGallery, mediaGalleryItem, section, separator, textDisplay, thumbnail } from "@skyhelperbot/utils";
import { CustomId } from "@/utils/customId-store";
const BASE =
  "**Here are some things that you can keep in mind during the game!**\n- You will have 30 seconds to answer in each round. Every attempt (or lack of within the specified time) will count as a wrong answer.\n- If you think you know the full word, you can type it so (like `Ascended Candles`).\n- The game initiator can stop the game anytime by typing `>stopgame` in the channel. Only finished games will count towards the leaderboard.";
const constants = {
  ["single"]: `${BASE}\n- Each wrong answer will cost lives. The embed will show how many live you have left. You'll loose if you fail to guess the word correctly before your lives runs out.`,
  ["double"]: `${BASE}\n- Each player will answer in turn, randomly picking for the first round, the player who guesses correctly will stay in the round until they guess incorrectly (or fail to do so within time), the round will pass to next person. Whoever guesses the word first wins.`,
};
const modalComponent = (id: string, word: string): APIModalInteractionResponseCallbackData => ({
  custom_id: "skygame_hangman_word_modal" + `-${id}`,
  title: "Provide a Word",
  components: [
    {
      type: 1, // ActionRow
      components: [
        {
          type: 4, // TextInput
          custom_id: "skygame_hangman_word_input",
          label: "Word",
          value: word || "",
          style: 1, // Short
          required: true,
        },
      ],
    },
  ],
});
export const handleHangman = async (helper: InteractionHelper, options: InteractionOptionResolver) => {
  const { client } = helper;

  const mode = options.getString("mode", true);
  // get game configs
  let word: string | null = null;
  let type: string = "random";
  const maxLives: number = 6;
  let players: APIUser[] = [helper.user];
  const getResponse = () => getMessageResponse(mode, type, word, players, helper, maxLives);

  const message = (await helper.reply(getResponse())).resource!.message;

  const col = client.componentCollector({
    idle: 90_000,
    filter: (i) =>
      (i.member?.user || i.user)!.id === helper.user.id ||
      // @ts-expect-error need extra check to get actions but yeah, loool
      client.utils.store.deserialize(i.data.custom_id).data.action === "instructions",
    message,
  });

  col.on("collect", async (i) => {
    const compoHelper = new InteractionHelper(i, client);
    const { id, data } = client.utils.store.deserialize(i.data.custom_id);
    if (id !== CustomId.SkyHagman) return;
    const { action } = data;
    if (compoHelper.isStringSelect(i)) {
      const value = i.data.values[0];
      if (action === "type") {
        type = value;
        if (value === "random") word = null;
        return await compoHelper.update({ ...getResponse() });
      }
    }

    if (compoHelper.isUserSelect(i)) {
      const resolved = Object.values(i.data.resolved.users);

      players = [...resolved];
      return await compoHelper.update({ ...getResponse() });
    }

    if (compoHelper.isButton(i)) {
      if (action === "word") {
        if (mode === "single") {
          return await compoHelper.reply({
            content: "Custom words are not allowed in single player mode.",
            flags: MessageFlags.Ephemeral,
          });
        }
        await compoHelper.launchModal(modalComponent(i.id, word || ""));

        const modalSubmit = await client
          .awaitModal({
            timeout: 60_000,
            filter: (modalint) => modalint.data.custom_id === "skygame_hangman_word_modal" + `-${i.id}`,
          })
          .catch(() => null);
        if (modalSubmit) {
          word = modalSubmit.data.components[0].components[0].value;
          await client.api.interactions.updateMessage(modalSubmit.id, modalSubmit.token, getResponse());
        }
      } else if (action === "start") {
        col.stop();
        const game = new Hangman(
          helper.int.channel as APITextChannel,
          {
            mode: mode as "single" | "double",
            type: type as "custom" | "random",
            players,
            ...(word ? { word } : {}),
            ...(mode === "single" ? { totalLives: maxLives } : {}),
            gameInitiator: helper.user,
          },
          client,
        );
        // remove the button row
        const components = i.message.components! as APIContainerComponent[];
        const rowCount = components[0].components.filter((c) => c.type === 1).length;

        components[0].components.splice(-rowCount, rowCount);

        await compoHelper.update({ components });

        client.gameData.set(helper.int.channel!.id, game);

        await game.inititalize();
      }
      if (action === "instructions") {
        await compoHelper.reply({
          components: [createGameInstrunctionEmbed(mode)],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
      }
    }
  });
};

function createComponents(mode: string, type: string, players: APIUser[], word: string | null, helper: InteractionHelper) {
  const components: APIActionRowComponent<APIComponentInMessageActionRow>[] = [];
  if (mode === "double") {
    components.push(
      {
        type: 1, // ActionRow
        components: [
          {
            type: 5, // UserSelectMenu
            custom_id: helper.client.utils.store.serialize(CustomId.SkyHagman, { action: "user", user: helper.user.id }),
            placeholder: "Select players",
            default_values: players.map((p) => ({ id: p.id, type: SelectMenuDefaultValueType.User })),
            max_values: 2,
            min_values: 2,
          },
        ],
      },
      {
        type: 1, // ActionRow
        components: [
          {
            type: 3, // StringSelectMenu
            custom_id: helper.client.utils.store.serialize(CustomId.SkyHagman, { action: "type", user: helper.user.id }),
            placeholder: "Select word type",
            options: [
              { label: "Random", description: "Bot selects random words", value: "random", default: type === "random" },
              { label: "Custom", description: "Provide your own word", value: "custom", default: type === "custom" },
            ],
          },
        ],
      },
    );
  }
  const disabled =
    (type === "custom" && !word) ||
    (mode === "double" && players.length !== 2) ||
    (mode === "double" && players.some((p) => p.bot)) ||
    (type === "custom" && players.some((p) => p.id === helper.user.id));
  components.push({
    type: 1, // ActionRow
    components: [
      {
        type: 2, // Button
        custom_id: helper.client.utils.store.serialize(CustomId.SkyHagman, { action: "start", user: helper.user.id }),
        label: "Start Game",
        style: disabled ? ButtonStyle.Danger : ButtonStyle.Success, // Success
        disabled,
      },
      ...(mode === "double" && type === "custom"
        ? [
            {
              type: 2,
              custom_id: helper.client.utils.store.serialize(CustomId.SkyHagman, { action: "word", user: helper.user.id }),
              label: "Provide Word",
              style: 1,
            },
          ] // Button
        : []),
      {
        type: 2,
        custom_id: helper.client.utils.store.serialize(CustomId.SkyHagman, { action: "instructions", user: null }),
        label: "Instructions",
        style: ButtonStyle.Secondary,
      },
    ],
  });

  return components;
}

function getMessageResponse(
  mode: string,
  type: string,
  word: string | null,
  players: APIUser[],
  helper: InteractionHelper,
  maxLives: number,
): RESTPostAPIChannelMessageJSONBody {
  const getCompletedStatus = (completed: boolean) => (completed ? "✅" : "❌");
  const settings: string[] = [
    `${emojis.tree_middle} **Selected Mode:** ${mode === "single" ? "Single Player" : "Double Player"}`,
    `${emojis.tree_middle} **Word Type:** ${type === "random" ? "Random" : "Custom"}`,
    `${mode === "single" ? emojis.tree_middle : emojis.tree_end} **Players:** ${players.map((p) => `<@${p.id}>`).join(", ")}`,
  ];
  if (mode === "single") settings.push(`${emojis.tree_end} **Max Lives:** ${maxLives}`);
  const requirements: string[] = [];
  if (mode === "double") {
    if (players.some((p) => p.bot)) {
      requirements.push("- ❌ Bot's cant't play (||duh!||). Please choose another user.");
    } else {
      requirements.push(
        `- ${getCompletedStatus(players.length === 2)} Mention the player you want to play with using the select menu below. (Min. 2 Players)`,
      );
    }

    if (type === "custom") {
      requirements.push(`- ${getCompletedStatus(!!word)} Provide a custom word.`);
      if (players.some((p) => p.id === helper.user.id)) {
        requirements.push(
          "- ❌ You can't be one of the player if word type is `custom` (||Trying to be sneaky, are we?||). Please choose another user.",
        );
      }
    }
  }

  const comp = container(
    section(
      thumbnail(
        "https://cdn.discordapp.com/attachments/867638574571323424/1341584782936768553/hangman.png?ex=67b687b1&is=67b53631&hm=fda4789028ff41867f448b90b4b0f50e096ef7ed48c54b0d8ef9b387b28f32b6&",
      ),
      "### Skygame: Hangman",
      settings.join("\n"),
    ),
    separator(),
  );
  if (requirements.length) {
    comp.components.push(textDisplay("**Provide the following information:**\n" + requirements.join("\n")), separator());
  }
  comp.components.push(...createComponents(mode, type, players, word, helper));

  return {
    components: [comp],
    flags: MessageFlags.IsComponentsV2,
  };
}

// #region leaderbord card
/**
 * Get hangman leaderboard card
 */
export const getCardResponse = async (
  helper: InteractionHelper,
  data: SkyGameStatsData,
  btnType: "singleMode" | "doubleMode",
  guildMembers: { members: APIGuildMember[] },
  guild: APIGuild,
  type: string,
  game: "hangman" | "scrambled",
): Promise<RESTPostAPIChannelMessageJSONBody & { files?: RawFile[] }> => {
  const { client } = helper;
  const players = await Promise.all(
    data[btnType].map(async (d, i): Promise<userData> => {
      const member: APIGuildMember | APIUser =
        type === "server" ? guildMembers!.members.find((m) => m.user.id === d.id)! : await client.api.users.get(d.id);
      return {
        tag: "user" in member ? member.user.username : member.username,
        games: d.gamesPlayed!,
        score: d.gamesWon!,
        top: i + 1,
        avatar: client.utils.getUserAvatar(member as APIGuildMember, guild?.id),
      };
    }),
  );
  const card = players.length && (await new LeaderboardCard({ usersData: players }).build());
  const btns: APIActionRowComponent<APIButtonComponent> = {
    type: 1,
    components: [
      {
        type: 2,
        style: 1,
        custom_id: client.utils.store.serialize(CustomId.SkyGameLeaderboard, { type: "singleMode", user: helper.user.id }),
        label: "Single Mode",
        disabled: btnType === "singleMode",
      },
      {
        type: 2,
        style: 1,
        custom_id: client.utils.store.serialize(CustomId.SkyGameLeaderboard, { type: "doubleMode", user: helper.user.id }),
        label: "Double Mode",
        disabled: btnType === "doubleMode",
      },
    ],
  };
  const comp = container(
    textDisplay(
      `${game.charAt(0).toUpperCase() + game.slice(1)} Leaderboard - ` +
        (type === "server" ? `\`Server (${guild!.name})\`` : "`Global`"),
    ),
    separator(),
    card
      ? mediaGallery(
          mediaGalleryItem("attachment://leaderboard.png", {
            description: `Top 10 players in the ${game} game for ` + (btnType === "doubleMode" ? "Double Mode" : "Single Mode"),
          }),
        )
      : textDisplay("Oops! Looks like no data is available for this type. Start playing to get on the leaderboard!"),
    btns,
  );
  let files: RawFile[] | undefined = undefined;
  if (card) {
    files = [{ data: card, name: "leaderboard.png" }];
  }
  return { files, components: [comp], attachments: [], flags: MessageFlags.IsComponentsV2 };
};

function createGameInstrunctionEmbed(mode: string) {
  return container(
    textDisplay("### SkyGame Instructions\n-# How to Play"),
    separator(),
    textDisplay(constants[mode as "single" | "double"]),
  );
}
