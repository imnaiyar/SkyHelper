import { setTimeout as wait } from "timers/promises";
import { hangmanWords } from "@skyhelperbot/constants";
import {
  AllowedMentionsTypes,
  type APIEmbed,
  type APITextChannel,
  type APIUser,
  type RESTPostAPIChannelMessageJSONBody,
} from "@discordjs/core";
import type { SkyHelper } from "@/structures";
import { updateUserGameStats } from "../utils.js";
import { MessageCollector } from "./Collector.js";
/** Base class for game controllers */
export abstract class GameController {
  /** Players participating in this game */
  public players: APIUser[];

  /** Original initiator of the game, used for managing the games, like stopping it mid interval */
  public initiator: APIUser | null = null;

  /** Whether this game is stopped or not */
  protected _stopped: boolean = false;

  /** Collector listening for stop */
  protected _stopCollector: MessageCollector | null = null;

  constructor(
    protected readonly channel: APITextChannel,
    players: APIUser[],
    gameInitiator: APIUser | null,
    protected readonly client: SkyHelper,
  ) {
    this.players = players;
    this.initiator = gameInitiator;
  }

  /** Initialize the game */
  public abstract initialize(): Promise<void>;

  /** Send a response to the channel */
  protected async _sendResponse(payload: RESTPostAPIChannelMessageJSONBody | string): Promise<any> {
    const createPayload = typeof payload === "string" ? { content: payload } : payload;
    return await this.client.api.channels.createMessage(this.channel.id, {
      ...createPayload,
      allowed_mentions: {
        parse: [AllowedMentionsTypes.User],
      },
    });
  }

  /** Set up listener for stopping the game */
  protected _listenForStop(stopResponseCode: number): void {
    if (!this.initiator) return;
    this._stopCollector = new MessageCollector(this.client, {
      filter: (m) => m.content.toLowerCase() === ">stopgame",
      channel: this.channel,
    });
    const initiator = this.initiator;
    this._stopCollector.on("collect", async (m) => {
      if (m.author.id !== initiator.id) {
        return await this._sendResponse("Only the game initiator can stop the game.");
      }
      this._stopped = true;
      await this._sendResponse(getScrambledResponse(stopResponseCode));
      if (this._stopCollector && !this._stopCollector.ended) this._stopCollector.stop();

      return this._endGame("stopped-game");
    });
  }

  /** End the game */
  protected abstract _endGame(reason?: string): Promise<void>;
}

/** Scrambled game manager with rounds */
export class Scrambled extends GameController {
  /** The words for each round */
  private currentWord: { original: string; scrambled: string };

  /** Total words used in the game */
  private words: Array<{ original: string; scrambled: string }> = [];

  /** Current round number (0-based) */
  private currentRound: number = 0;

  /** Total number of rounds */
  private totalRounds: number;

  /** Player stats tracking scores and guesses */
  public playerStats: Map<string, PlayerRoundStats> = new Map();

  /** Time per round in milliseconds */
  private timePerRound: number = 30000;

  /** Round winner for the current round */
  private roundWinner: APIUser | null = null;

  constructor(channel: APITextChannel, option: ScrambledRoundsOptions, client: SkyHelper) {
    super(channel, option.players, option.gameInitiator || null, client);
    this.currentWord = scrambleWord();
    this.words.push(this.currentWord);
    if (option.players.length !== 2) {
      throw new Error("Scrambled game requires exactly two players");
    }

    this.totalRounds = option.maxRounds || 10;

    // Initialize player stats
    for (const player of this.players) {
      this.playerStats.set(player.id, {
        totalCorrect: 0,
        rounds: Array(this.totalRounds)
          .fill(null)
          .map(() => ({ correct: false, attemptTime: null })),
      });
    }

    if (option.timePerRound) this.timePerRound = option.timePerRound;
  }

  public async initialize(): Promise<void> {
    // Send initial message
    await this._sendResponse(getScrambledResponse(ScrambledResponseCodes.GameStart, this.totalRounds));
    await wait(3000);

    // Start the first round
    this._startRound();
    this._listenForStop(ScrambledResponseCodes.EndGame);
  }

  private async _startRound(): Promise<void> {
    if (this._stopped) return;

    // Reset round winner
    this.roundWinner = null;

    await this._sendResponse(
      getScrambledResponse(
        ScrambledResponseCodes.RoundStart,
        this.currentRound + 1,
        this.totalRounds,
        this.currentWord.scrambled,
      ),
    );

    await this._sendResponse(await this._getRoundEmbedResponse());

    this._collectRoundResponses();
  }

  private async _collectRoundResponses(): Promise<void> {
    if (this._stopped) return;

    const message = await this.client
      .awaitMessages({
        filter: (m) =>
          this.players.some((p) => p.id === m.author.id) &&
          m.content.toLowerCase() !== ">stopgame" &&
          m.content.toLowerCase() === this.currentWord.original.toLowerCase(),
        channel: this.channel,
        timeout: this.timePerRound,
        max: 1,
      })
      .then((m) => m[0])
      .catch(() => "Timeout");
    if (this._stopped) return;
    if (typeof message === "string") {
      await this._sendResponse(getScrambledResponse(ScrambledResponseCodes.RoundTimeUp, this.currentWord.original));
      this._advanceRound();
      return;
    }
    const playerId = message.author.id;

    this.roundWinner = message.author;

    const stats = this.playerStats.get(playerId)!;
    stats.totalCorrect++;
    stats.rounds[this.currentRound] = {
      correct: true,
      attemptTime: Date.now(),
    };

    await this._sendResponse(
      getScrambledResponse(ScrambledResponseCodes.CorrectRoundGuess, message.author.id, this.currentWord.original),
    );

    this._advanceRound();
  }

  private async _advanceRound(): Promise<void> {
    if (this._stopped) return;

    this.currentRound++;

    // show round results
    await this._sendResponse(await this._getRoundResultsEmbed());
    this.currentWord = scrambleWord();
    this.words.push(this.currentWord);
    await wait(3000);

    // check if completed all rounds
    if (this.currentRound >= this.totalRounds) {
      return this._endGame();
    }

    // Start next round
    this._startRound();
  }

  private async _getRoundEmbedResponse(): Promise<RESTPostAPIChannelMessageJSONBody> {
    const embed: APIEmbed = {
      title: `Skygame: Scrambled - Round ${this.currentRound + 1}/${this.totalRounds}`,
      description: `## Unscramble this word!
      
**Scrambled Word:** \`${this.currentWord.scrambled.toUpperCase()}\`

**Hint:** ${this._getHint(this.currentWord.original)}

The first player to correctly unscramble the word wins this round!

Remaining Time: <a:30sec:1288835107804676243>

-# The game initiator can stop the game anytime by typing \`>stopgame\`.`,
      color: 0x3498db,
    };

    return { embeds: [embed] };
  }

  private async _getRoundResultsEmbed(): Promise<RESTPostAPIChannelMessageJSONBody> {
    const scoreBoard = this.players
      .map((player) => {
        const stats = this.playerStats.get(player.id)!;
        return `<@${player.id}> - Score: ${stats.totalCorrect}`;
      })
      .join("\n");

    const embed: APIEmbed = {
      title: `Round ${this.currentRound}/${this.totalRounds} Results`,
      description: `${this.roundWinner ? `**Winner:** <@${this.roundWinner.id}>` : "**No one** guessed the word correctly!"}
      
**Word:** ${this.currentWord.original}

**Current Scores:**
${scoreBoard}

${this.currentRound < this.totalRounds ? `Next round starting in 3 seconds...` : `Final results coming up...`}`,
      color: 0x2ecc71,
    };

    return { embeds: [embed] };
  }

  private _getHint(word: string): string {
    const wordLength = word.length;
    const hintsToReveal = Math.max(1, Math.floor(wordLength / 4));

    let hint = "";
    for (let i = 0; i < wordLength; i++) {
      if (i % Math.floor(wordLength / hintsToReveal) === 0) {
        hint += word[i];
      } else {
        hint += "\\_";
      }
    }

    return hint;
  }

  protected async _endGame(reason?: string): Promise<void> {
    if (this._stopCollector && !this._stopCollector.ended) this._stopCollector.stop();

    let winner: APIUser | null = null;
    let highestScore = 0;

    for (const player of this.players) {
      const stats = this.playerStats.get(player.id)!;
      if (stats.totalCorrect > highestScore) {
        highestScore = stats.totalCorrect;
        winner = player;
      } else if (stats.totalCorrect === highestScore && highestScore > 0) {
        // If tie, determine the winner by who was faster overall
        const otherPlayerId = this.players.find((p) => p.id !== player.id)!.id;
        const playerTotalTime = stats.rounds.filter((r) => r && r.correct).reduce((sum, r) => sum + (r!.attemptTime || 0), 0);

        const otherPlayerTotalTime = this.playerStats
          .get(otherPlayerId)!
          .rounds.filter((r) => r && r.correct)
          .reduce((sum, r) => sum + (r!.attemptTime || 0), 0);

        if (playerTotalTime < otherPlayerTotalTime) {
          winner = player;
        }
      }
    }

    if (!reason || reason !== "stopped-game") {
      for (const player of this.players) {
        updateUserGameStats(player, "scrambled", "doubleMode", player.id === winner?.id).catch(this.client.logger.error);
      }
    }

    // Generate detailed results
    const roundByRoundResults = this.words
      .map((word, i) => {
        let roundWinnerText = "No one";
        for (const player of this.players) {
          const playerRound = this.playerStats.get(player.id)!.rounds[i];
          if (playerRound && playerRound.correct) {
            roundWinnerText = `<@${player.id}>`;
            break;
          }
        }

        return `**Round ${i + 1}:** Word: ${word.original} - Winner: ${roundWinnerText}`;
      })
      .join("\n");

    // Create final results embed
    const embed: APIEmbed = {
      title: "SkyGame: Scrambled - Final Results",
      description: `### ${
        winner
          ? `Winner: <@${winner.id}> \`(${winner.username})\` with ${this.playerStats.get(winner.id)!.totalCorrect} correct guesses!`
          : "It's a tie!"
      }
      
**Final Scores:**
${this.players
  .map((player) => {
    const stats = this.playerStats.get(player.id)!;
    return `- <@${player.id}> - \`${player.username}\`: ${stats.totalCorrect}/${this.totalRounds} words`;
  })
  .join("\n")}

**Round by Round Results:**
${roundByRoundResults}`,
      author: {
        name: "SkyGame: Scrambled | SkyHelper",
        icon_url: this.client.utils.getUserAvatar(this.client.user),
      },
      color: 0xf1c40f,
    };

    await this._sendResponse({ embeds: [embed] });
    this.client.gameData.delete(this.channel.id);
  }
}

interface ScrambledRoundsOptions {
  players: APIUser[];

  gameInitiator?: APIUser;
  maxRounds?: number;
  timePerRound?: number;
}

type PlayerRoundStats = {
  totalCorrect: number;
  rounds: Array<{ correct: boolean; attemptTime: number | null } | null>;
};

// Add to constants file
export enum ScrambledResponseCodes {
  NotInitialized = 0,
  GameStart = 1,
  RoundStart = 2,
  CorrectRoundGuess = 3,
  WrongRoundGuess = 4,
  RoundTimeUp = 5,
  EndGame = 6,
}

// Add to constants file
export function getScrambledResponse(code: ScrambledResponseCodes, ...args: any[]): string {
  switch (code) {
    case ScrambledResponseCodes.NotInitialized:
      return "Game not initialized properly!";
    case ScrambledResponseCodes.GameStart:
      return `Welcome to Scrambled Rounds! This game will have **${args[0]}** rounds. The player with the most correct guesses wins!`;
    case ScrambledResponseCodes.RoundStart:
      return `**Round ${args[0]}/${args[1]}**\nYour word to unscramble is: **${args[2]}**`;
    case ScrambledResponseCodes.CorrectRoundGuess:
      return `<@${args[0]}> correctly unscrambled the word: **${args[1]}**!`;
    case ScrambledResponseCodes.WrongRoundGuess:
      return `<@${args[0]}> guessed "${args[1]}" - not correct!`;
    case ScrambledResponseCodes.RoundTimeUp:
      return `Time's up! The correct word was: **${args[0]}**`;
    case ScrambledResponseCodes.EndGame:
      return "The game has been stopped by the initiator.";
    default:
      return "Unknown response code";
  }
}

export function scrambleWord() {
  const word = hangmanWords.random().toLowerCase();

  const words = word.split(" ");

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
