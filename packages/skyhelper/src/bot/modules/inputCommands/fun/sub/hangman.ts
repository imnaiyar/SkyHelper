import { Hangman } from "@/utils/classes/Hangman";
import type { getTranslator } from "@/i18n";

import { LeaderboardCard, parsePerms, resolveColor, type Permission, type userData } from "@skyhelperbot/utils";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
import {
  ButtonStyle,
  SelectMenuDefaultValueType,
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIEmbed,
  type APIGuild,
  type APIGuildMember,
  type APIMessageActionRowComponent,
  type APIMessageComponentInteraction,
  type APIModalInteractionResponseCallbackData,
  type APITextChannel,
  type APIUser,
  type RESTPostAPIChannelMessageJSONBody,
} from "@discordjs/core";
import { SendableChannels } from "@skyhelperbot/constants";
import { PermissionsUtil } from "@/utils/classes/PermissionUtils";
import type { RawFile } from "@discordjs/rest";
import type { SkyGameStatsData } from "@/types/custom";
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
export const handleHangman = async (
  helper: InteractionHelper,
  t: ReturnType<typeof getTranslator>,
  options: InteractionOptionResolver,
) => {
  const { client } = helper;
  const guild = client.guilds.get(helper.int.guild_id || "");

  const mode = options.getString("mode", true);
  // get game configs
  let word: string | null = null;
  let type: string = "random";
  const maxLives: number = 6;
  let players: APIUser[] = [helper.user];
  const getResponse = () => getMessageResponse(mode, type, word, players, helper, maxLives);

  const validateAndReply = async (int: APIMessageComponentInteraction, message: string, ephemeral = true) => {
    const compHelper = new InteractionHelper(int, client);
    await compHelper.update(getResponse());
    return await compHelper.followUp({ content: message, flags: ephemeral ? 64 : undefined });
  };

  const message = (await helper.reply(getResponse())).resource!.message;

  const col = client.componentCollector({
    idle: 90_000,
    filter: (i) => (i.member?.user || i.user)!.id === helper.user.id,
    message,
  });

  col.on("collect", async (i) => {
    const compoHelper = new InteractionHelper(i, client);
    const { action } = client.utils.parseCustomId(i.data.custom_id);

    if (compoHelper.isStringSelect(i)) {
      const value = i.data.values[0];
      if (action === "type") {
        if (value === "custom" && players.some((p) => p.id === compoHelper.user.id)) {
          return validateAndReply(
            i,
            "You can't change the word type to 'custom' when you are one of the player, either choose someone else, or continue",
          );
        }
        type = value;
        if (value === "random") word = null;
        return await compoHelper.update({ ...getResponse() });
      }
    }

    if (compoHelper.isUserSelect(i)) {
      const resolved = Object.values(i.data.resolved.users);
      if (type === "custom" && resolved.some((u) => u.id === compoHelper.user.id)) {
        return validateAndReply(i, "You can't play with yourself when providing a custom word.");
      }

      players = [...resolved];
      return await compoHelper.update({ ...getResponse() });
    }

    if (compoHelper.isButton(i)) {
      if (action === "word") {
        if (mode === "single") {
          return validateAndReply(i, "Custom words are not allowed in single mode.");
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
        await compoHelper.update({ components: [] });

        client.gameData.set(helper.int.channel!.id, game);

        await game.inititalize();
      }
    }
  });
};

function createComponents(mode: string, type: string, players: APIUser[], word: string | null, helper: InteractionHelper) {
  const components: APIActionRowComponent<APIMessageActionRowComponent>[] = [];
  if (mode === "double") {
    components.push(
      {
        type: 1, // ActionRow
        components: [
          {
            type: 5, // UserSelectMenu
            custom_id: helper.client.utils.encodeCustomId({ id: "skygame_hangman", action: "user", user: helper.user.id }),
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
            custom_id: helper.client.utils.encodeCustomId({ id: "skygame_hangman", action: "type", user: helper.user.id }),
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
    (mode === "double" && players.some((p) => p.bot));
  components.push({
    type: 1, // ActionRow
    components: [
      ...(mode === "double" && type === "custom"
        ? [
            {
              type: 2,
              custom_id: helper.client.utils.encodeCustomId({ id: "skygame_hangman", action: "word", user: helper.user.id }),
              label: "Provide Word",
              style: 1,
            },
          ] // Button
        : []),
      {
        type: 2, // Button
        custom_id: helper.client.utils.encodeCustomId({ id: "skygame_hangman", action: "start", user: helper.user.id }),
        label: players.some((p) => p.bot)
          ? "You can't play with a bot"
          : mode === "double" && players.length < 2
            ? "Select at least two players"
            : "Start Game",
        style: disabled ? ButtonStyle.Danger : ButtonStyle.Success, // Success
        disabled,
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
  let description = `**Selected Mode:** ${mode === "single" ? "Single Player" : "Double Player"}\n`;
  description += `**Word Type:** ${type === "custom" ? "Custom" : "Random"}\n`;
  description += `${mode === "single" ? `**Max Lives:** ${maxLives}\n` : ""}`;
  if (mode === "double") {
    description += `**Players:** ${players.map((p) => `<@${p.id}>`).join(", ")}\n`;
    description += `**Provide the following information:**\n`;
    description += `${mode === "double" ? `- ${getCompletedStatus(players.length === 2)} Mention the player you want to play with using the select menu below. (Min. 2 Players)\n` : ""}`;
    description += `${type === "custom" ? `- ${getCompletedStatus(!!word)} Provide a custom word.\n` : ""}`;
  }
  description += `${constants[mode as "single" | "double"]}`;

  const embed: APIEmbed = {
    title: "Skygame: Hangman",
    description,
    color: 0x00ff00,
  };

  return {
    embeds: [embed],
    components: createComponents(mode, type, players, word, helper),
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
        // @ts-expect-error heck it
        avatar: client.utils.getUserAvatar(member, guild?.id),
      };
    }),
  );
  const card = players.length && (await new LeaderboardCard({ usersData: players }).build());
  const embed: APIEmbed = {
    title:
      `${game.charAt(0).toUpperCase() + game.slice(1)} Leaderboard - ` +
      (type === "server" ? `\`Server (${guild!.name})\`` : "`Global`"),
    description:
      `**Top 10 players in the ${game} game - \`${btnType === "singleMode" ? "Single Mode" : "Double Mode"}\`**\n\n` +
      (card ? "" : "Oops! Looks like no data is available for this type. Start playing to get on the leaderboard!"),
    ...(card ? { image: { url: "attachment://leaderboard.png" } } : {}),
    color: resolveColor("DarkAqua"),
  };
  const btns: APIActionRowComponent<APIButtonComponent> = {
    type: 1,
    components: [
      {
        type: 2,
        style: 1,
        custom_id: client.utils.encodeCustomId({ id: "leaderboard_skygame", type: "singleMode", user: helper.user.id }),
        label: "Single Mode",
        disabled: btnType === "singleMode",
      },
      {
        type: 2,
        style: 1,
        custom_id: client.utils.encodeCustomId({ id: "leaderboard_skygame", type: "doubleMode", user: helper.user.id }),
        label: "Double Mode",
        disabled: btnType === "doubleMode",
      },
    ],
  };
  let files: RawFile[] | undefined = undefined;
  if (card) {
    files = [{ data: card, name: "leaderboard.png" }];
  }
  return { embeds: [embed], files, components: [btns], attachments: [] };
};
