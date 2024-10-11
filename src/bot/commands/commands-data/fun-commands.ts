import type { Command } from "#bot/structures/Command";
import { ApplicationCommandOptionType } from "discord.js";

// #region Hug
export const HUG_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "hug",
  description: "sky hug someone",
  prefix: {
    aliases: ["skyhug"],
    minimumArgs: 1,
    usage: "<ID|mention>",
  },
  slash: {
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
};

// #region SkyGame
export const SKY_GAME_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "skygame",
  description: "Various fun games based around Sky: CotL",
  slash: {
    integration_types: [0, 1],
    contexts: [0, 1, 2],
    options: [
      {
        name: "hangman",
        description: "Play a game of hangman based on sky-related words, or a custom word",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: "mode",
            description: "The mode of the game",
            choices: [
              { name: "Single Player", value: "single" },
              { name: "Double Player", value: "double" },
            ],
            required: true,
          },
        ],
      },
      {
        name: "leaderboard",
        description: "View the leaderboard for the skygames",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: "game",
            description: "The game to view the leaderboard for",
            choices: [{ name: "Hangman", value: "hangman" }],
            required: true,
          },
          {
            type: ApplicationCommandOptionType.String,
            name: "leaderboard-type",
            description: "Gloabal leaderboard or server specific (default: global)",
            choices: [
              { name: "Global", value: "global" },
              { name: "Server", value: "server" },
            ],
            required: false,
          },
        ],
      },
    ],
  },
  botPermissions: ["SendMessages"],
};
