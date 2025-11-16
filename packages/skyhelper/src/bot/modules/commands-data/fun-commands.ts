import type { Command } from "@/structures/Command";
import type { OverrideLocalizations } from "@/types/utils";
import { ApplicationCommandOptionType, InteractionContextType, type APIApplicationCommandStringOption } from "@discordjs/core";

// #region Hug
export const HUG_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "hug",
  description: "sky hug someone",
  prefix: {
    aliases: ["skyhug"],
    minimumArgs: 1,
    usage: "<ID|mention>",
  },
  data: {
    options: [
      {
        name: "user",
        description: "the user to hug",
        required: true,
        type: ApplicationCommandOptionType.User,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  category: "Fun",
};

// #region SkyGame
const SKYGAME_MODE_OPTION: Array<OverrideLocalizations<APIApplicationCommandStringOption>> = [
  {
    type: ApplicationCommandOptionType.String,
    name: "mode",
    name_localizations: "commands:SKYGAME.SUB.HANGMAN.options.mode.name",
    description_localizations: "commands:SKYGAME.SUB.HANGMAN.options.mode.description",
    description: "The mode of the game",
    choices: [
      {
        name: "Single Player",
        value: "single",
        name_localizations: "commands:SKYGAME.SUB.HANGMAN.options.mode.choices.single",
      },
      {
        name: "Double Player",
        value: "double",
        name_localizations: "commands:SKYGAME.SUB.HANGMAN.options.mode.choices.double",
      },
    ],
    required: true,
  },
];

export const SKY_GAME_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "skygame",
  description: "Various fun games based around Sky: CotL",
  data: {
    name_localizations: "commands:SKYGAME.name",
    description_localizations: "commands:SKYGAME.description",
    integration_types: [0, 1],
    contexts: [0, 1, 2],
    options: [
      {
        name: "hangman",
        name_localizations: "commands:SKYGAME.SUB.HANGMAN.name",
        description_localizations: "commands:SKYGAME.SUB.HANGMAN.description",
        description: "Play a game of hangman based on sky-related words, or a custom word",
        type: ApplicationCommandOptionType.Subcommand,
        options: SKYGAME_MODE_OPTION,
      },
      {
        name: "scrambled",
        description: "Unscramble the word to win",
        name_localizations: "commands:SKYGAME.SUB.SCRAMBLE.name",
        description_localizations: "commands:SKYGAME.SUB.SCRAMBLE.description",
        type: ApplicationCommandOptionType.Subcommand,
        options: SKYGAME_MODE_OPTION,
      },
      {
        name: "guessing",
        description: "Test your knowledge about Sky: Children of the Light",
        name_localizations: "commands:SKYGAME.SUB.GUESSING.name",
        description_localizations: "commands:SKYGAME.SUB.GUESSING.description",
        type: ApplicationCommandOptionType.Subcommand,
        options: SKYGAME_MODE_OPTION,
      },
      {
        name: "leaderboard",
        name_localizations: "commands:SKYGAME.SUB.LEADERBOARD.name",
        description_localizations: "commands:SKYGAME.SUB.LEADERBOARD.description",
        description: "View the leaderboard for the skygames",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: "game",
            name_localizations: "commands:SKYGAME.SUB.LEADERBOARD.options.game.name",
            description_localizations: "commands:SKYGAME.SUB.LEADERBOARD.options.game.description",
            description: "The game to view the leaderboard for",
            choices: [
              {
                name: "Hangman",
                value: "hangman",
                name_localizations: "commands:SKYGAME.SUB.LEADERBOARD.options.game.choices.hangman",
              },
              {
                name: "Scrambled",
                value: "scrambled",
                name_localizations: "commands:SKYGAME.SUB.SCRAMBLE.name",
              },
              {
                name: "Guessing",
                value: "guessing",
                name_localizations: "commands:SKYGAME.SUB.GUESSING.name",
              },
            ],
            required: true,
          },
          {
            type: ApplicationCommandOptionType.String,
            name: "leaderboard-type",
            name_localizations: "commands:SKYGAME.SUB.LEADERBOARD.options.leaderboard-type.name",
            description_localizations: "commands:SKYGAME.SUB.LEADERBOARD.options.leaderboard-type.description",
            description: "Gloabal leaderboard or server specific (default: global)",
            choices: [
              {
                name: "Global",
                name_localizations: "commands:SKYGAME.SUB.LEADERBOARD.options.leaderboard-type.choices.global",
                value: "global",
              },
              {
                name: "Server",
                name_localizations: "commands:SKYGAME.SUB.LEADERBOARD.options.leaderboard-type.choices.server",
                value: "server",
              },
            ],
            required: false,
          },
        ],
      },
    ],
  },
  botPermissions: ["SendMessages", "ViewChannel"],
  forSubs: ["hangman"],
  category: "Fun",
};
