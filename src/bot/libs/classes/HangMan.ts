import { EmbedBuilder, type SendableChannels, type User, type MessageCreateOptions } from "discord.js";
import { setTimeout as wait } from "timers/promises";
import { hangmanWords } from "../constants/hangmanWord.js";

/** Hangman game manager */
export class Hangman {
  /** Winner of this hangman game */
  public winner: null | User = null;

  /** Mode of this game, for "single" games, players will not be able to use custom types */
  public mode: "single" | "double" = "single";

  /** Type of the game, "custom" is only available for double player games */
  public type: "custom" | "random" = "random";

  /** Total lives of the player in single-mode game */
  public totalLives: number = 7;

  /** Remaining lives of the player in single-mode game */
  public remainingLives: number = this.totalLives;

  /** The player whose current turn is (in double-mode game) */
  private currentPlayer: User | null = null;

  /** Players participating in this game */
  public players: User[];

  /** Player stats for the game */
  public playerStats: Map<string, PlayerStats> = new Map();

  /** The word for the game */
  public word: string;

  /** Original initiator of the game, used for managing the games, like stopping it mid interval  */
  public initiator: User | null = null;

  public alphabets: HangmanWords | null = null;

  public alphabetLength: number | null = null;

  /** The english alphabets that has been guessed */
  private guessedAlphabets: (typeof EnglishAlphabets)[number][] = [];

  constructor(
    private readonly channel: SendableChannels,
    option: HangmanOptions,
  ) {
    if (option.mode) this.mode = option.mode;

    if (option.type && this.mode !== "single") this.type = option.type;

    if (this.mode === "single" && option.players.length > 1) throw new Error("Only one player must be provided for single mode");

    this.players = option.players;
    for (const player of this.players) {
      this.playerStats.set(player.id, { incorrectGuesses: 0, correctGuesses: 0 });
    }
    // prettier-ignore
    if (this.mode === "single" && option.totalLives) (this.totalLives = option.totalLives), (this.remainingLives = option.totalLives);

    if (option.type === "custom") {
      if (!option.word) throw new Error("Option 'word' must be provided if the game type is set to 'custom'");
      this.word = option.word;
    } else {
      this.word = hangmanWords.random();
    }
    if (option.gameInitiator) this.initiator = option.gameInitiator;
  }
  public async inititalize() {
    this.alphabets = this.word.split("").map((w, i) => ({
      guessed: EnglishAlphabets.some((wo) => wo.toLowerCase() === w.toLowerCase()) ? false : true, // Make any non-english characters already guessed
      alphabet: w,
      position: i,
      guessedBy: null,
    }));

    // @ts-ignore
    this.alphabetLength = this.alphabets.filter((alp) => EnglishAlphabets.includes(alp.alphabet.toLowerCase())).length;
    this.currentPlayer = this.players.random();
    if (this.mode === "double") {
      await this._sendResponse(getHangmanResponse(HangmanResponseCodes.FirstRound, this.currentPlayer));
    } else {
      await this._sendResponse(getHangmanResponse(HangmanResponseCodes.SingleModeStart, this.totalLives));
    }
    this._collectResponse();
    this._listenForStop();
  }

  private async _collectResponse(): Promise<any> {
    await this._sendResponse({ embeds: [this._getEmbed()] });
    const res = await this._getCollectorResponse();
    if (res === "Timeout") {
      if (this.mode === "double") this.currentPlayer = this.players.find((p) => p.id !== this.currentPlayer!.id)!;
      if (this.mode === "single") {
        this.remainingLives--;
        if (this.remainingLives <= 0) {
          this._sendResponse(getHangmanResponse(HangmanResponseCodes.LivesExhausted, this.word));
          await wait(2000);
          return this._endGame();
        }
      }
      this._sendResponse(
        getHangmanResponse(HangmanResponseCodes.Timeout) +
          (this.mode === "double" ? getHangmanResponse(HangmanResponseCodes.NextUp, this.currentPlayer) : ""),
      );
      return this._collectResponse();
    }
    const validate = this._validateAnswer(res.content.toLowerCase());
    switch (validate) {
      case HangmanResponseCodes.GuessedFullWord: {
        this.winner = this.currentPlayer;
        const unguessedWords = this.alphabets!.filter((a) => !a.guessed);
        const stat = this.playerStats.get(this.currentPlayer!.id)!;
        stat.correctGuesses += unguessedWords.length;
        this.playerStats.set(this.currentPlayer!.id, stat);
        this._sendResponse(getHangmanResponse(validate, this.winner, this.word));
        await wait(2000);
        return this._endGame();
      }
      case HangmanResponseCodes.GuessSuccess: {
        this._sendResponse(
          getHangmanResponse(validate) +
            (this.mode === "double" ? " " + getHangmanResponse(HangmanResponseCodes.NextUp, this.currentPlayer) : ""),
        );
        const stat = this.playerStats.get(this.currentPlayer!.id)!;
        stat.correctGuesses++;
        this.playerStats.set(this.currentPlayer!.id, stat);
        if (this.alphabets!.every((a) => a.guessed)) {
          this.winner = this.currentPlayer;
          this._sendResponse(getHangmanResponse(HangmanResponseCodes.Winner, this.winner, this.word));
          await wait(2000);
          return this._endGame();
        }
        await wait(2000);
        return this._collectResponse();
      }
      default: {
        const stat = this.playerStats.get(this.currentPlayer!.id)!;
        stat.incorrectGuesses++;
        this.playerStats.set(this.currentPlayer!.id, stat);

        // Only switch for double mode games
        if (this.mode === "double") this.currentPlayer = this.players.find((p) => p.id !== this.currentPlayer!.id)!;
        if (this.mode === "single") {
          this.remainingLives--;
          if (this.remainingLives <= 0) {
            this._sendResponse(getHangmanResponse(HangmanResponseCodes.LivesExhausted, this.word));
            await wait(2000);
            return this._endGame();
          }
        }

        this._sendResponse(getHangmanResponse(validate, res.content));
        if (this.mode === "double") this._sendResponse(getHangmanResponse(HangmanResponseCodes.NextUp, this.currentPlayer));
        await wait(3000);
        return this._collectResponse();
      }
    }
  }
  private _validateAnswer(word: string) {
    if (this.word.toLowerCase() === word) {
      this.alphabets?.forEach((a) => {
        if (!a.guessedBy || !a.guessed) (a.guessed = true), (a.guessedBy = this.currentPlayer!);
      });
      return HangmanResponseCodes.GuessedFullWord;
    }
    if (word.length > 1) return HangmanResponseCodes.WrongWordGuess;
    if (!EnglishAlphabets.some((a) => a.toLowerCase() === word)) {
      return HangmanResponseCodes.NotAnAlphabet;
    }
    if (this.guessedAlphabets.some((a) => a.toLowerCase() === word)) return HangmanResponseCodes.AlreadyGuessed;

    this.guessedAlphabets.push(word as (typeof EnglishAlphabets)[number]);

    // prettier-ignore
    if (!this.alphabets) throw new Error("Alphabets not initialized, the game may have been started without proper initialization");

    if (!this.alphabets.some((a) => a.alphabet.toLowerCase() === word)) return HangmanResponseCodes.WrongGuess;
    this.alphabets.forEach((alp) => {
      if (alp.alphabet.toLowerCase() === word) (alp.guessed = true), (alp.guessedBy = this.currentPlayer);
    });
    return HangmanResponseCodes.GuessSuccess;
  }

  private async _getCollectorResponse() {
    if (!this.currentPlayer) {
      throw new Error(getHangmanResponse(HangmanResponseCodes.NotInitialized));
    }
    const curr = this.currentPlayer;
    const col = await this.channel.awaitMessages({
      time: 30_000,
      filter: (m) => m.author.id === curr.id && m.content.toLowerCase() !== ">stopgame",
      max: 1,
    });
    if (!col.size) return "Timeout";
    return col.first()!;
  }

  private _getEmbed() {
    if (!this.currentPlayer || !this.alphabets) throw new Error(getHangmanResponse(HangmanResponseCodes.NotInitialized));
    let remaininglives: string | null = null;
    if (this.mode === "single") {
      remaininglives = "";
      const lostLives = this.totalLives - this.remainingLives;
      for (let i = 0; i < this.remainingLives; i++) {
        remaininglives += "<:red_heart:1287689366671593526>";
      }
      for (let i = 0; i < lostLives; i++) {
        remaininglives += "<:gray_heart:1287689388758798396>";
      }
    }
    return new EmbedBuilder().setTitle("Skygame: Hangman [BETA]").setDescription(
      `## ${this.mode === "single" ? `${this.currentPlayer} is currently guessing!` : `It's ${this.currentPlayer} turn!`}\nWord: **__${this.alphabets
        .map((a) => {
          if (a.guessed) return a.alphabet === " " ? a.alphabet : `${a.alphabet}`;
          else return "ℹ️";
        })
        .join(
          "",
        )}__** (${this.alphabetLength!} alphabets excluding special characters)\n\n**Guessed Alphabets:**\n > ${this.guessedAlphabets.map((g) => `\`${g.toUpperCase()}\``).join(", ")}${
        this.mode === "single" ? `\n\n**Remaining Lives(${this.remainingLives}):** ${remaininglives}` : ""
      }\n\nRemaining Time: <a:30s:1287391044127952947>\n\n-# The game initiator can stop the game anytime by typing \`>stopgame\`.`,
    );
  }

  private async _endGame() {
    if (this.winner) {
      const user = await this.channel.client.database.getUser(this.winner);
      // prettier-ignore
      if (!user.gameData) user.gameData = { hangman: { singleMode: { gamesPlayed: 0, gamesWon: 0 }, doubleMode: { gamesPlayed: 0, gamesWon:0 } } };
      user.gameData.hangman[this.mode === "single" ? "singleMode" : "doubleMode"].gamesWon++;
      user.gameData.hangman[this.mode === "single" ? "singleMode" : "doubleMode"].gamesPlayed++;
      await user.save();
    }
    const embed = new EmbedBuilder()
      .setTitle("SkyGame: Hangman")
      .setDescription(
        `### Winner: ${this.winner ? this.winner : "None"} \`(${this.winner?.displayName || ""})\`\n\n**Word to guess was**: ${this.word}\n\n**Stats:**\n${this._getPlayerStats()}`,
      )
      .setAuthor({ name: `SkyGame: Hangman | SkyHelper`, iconURL: this.channel.client.user.displayAvatarURL() });
    this._sendResponse({ embeds: [embed] });
  }

  private _getPlayerStats() {
    return this.players
      .map((player) => {
        const stat = this.playerStats.get(player.id)!;
        const correctGuesses = stat.correctGuesses;
        const incorrectGuesses = stat.incorrectGuesses;
        const correctPercent = (correctGuesses / this.alphabetLength!) * 100;
        const incorrectPercent = (incorrectGuesses / this.alphabetLength!) * 100;
        return `- ${player} - \`${player.displayName}\`: Correct Guesses: ${correctGuesses}/${this.alphabetLength!} (${correctPercent.toFixed(2)}%), Incorrect Guesses: ${incorrectGuesses} (${incorrectPercent.toFixed(2)})`;
      })
      .join("\n");
  }

  private async _sendResponse(payload: string | MessageCreateOptions) {
    const createPayload = typeof payload === "string" ? { content: payload } : payload;
    return await this.channel.send({ ...createPayload, allowedMentions: { parse: ["users"] } });
  }

  private _listenForStop() {
    if (!this.initiator) return;
    const col = this.channel.createMessageCollector({ filter: (m) => m.content.toLowerCase() === ">stopgame" });
    const initiator = this.initiator;
    col.on("collect", async (m) => {
      if (m.author.id !== initiator.id) {
        return await this._sendResponse("Only the game initiator can stop the game.");
      }
      await this._sendResponse(getHangmanResponse(HangmanResponseCodes.EndmGame));
      col.stop();
      return this._endGame();
    });
  }
}
type HangmanOptionsBase = { mode?: "single" | "double"; players: User[]; totalLives?: number; gameInitiator?: User };
interface HangmanCustomModeOption extends HangmanOptionsBase {
  type?: "custom";
  word: string;
}
interface HangmanRandomModeOptions extends HangmanOptionsBase {
  type?: "random";
}
type HangmanOptions = HangmanCustomModeOption | HangmanRandomModeOptions;

type HangmanWords = {
  guessed: boolean;
  alphabet: string;
  position: number;
  guessedBy: User | null;
}[];

// prettier-ignore
const EnglishAlphabets = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l",
  "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"] as const;

type PlayerStats = {
  correctGuesses: number;
  incorrectGuesses: number;
};
enum HangmanResponseCodes {
  Timeout,
  NotAnAlphabet,
  AlreadyGuessed,
  WrongGuess,
  GuessSuccess,
  NextUp,
  Winner,
  NotInitialized,
  FirstRound,
  GuessedFullWord,
  WrongWordGuess,
  SingleModeStart,
  LivesExhausted,
  EndmGame,
}

const HangmanResponses: Record<HangmanResponseCodes, string | ((...args: any[]) => string)> = {
  [HangmanResponseCodes.Timeout]: `Timed-out! You took too long to answer.`,
  [HangmanResponseCodes.NotAnAlphabet]: "The given answer is not an English alphabet!",
  [HangmanResponseCodes.AlreadyGuessed]: (letter: string) => `\`${letter}\` has already been guessed.`,
  [HangmanResponseCodes.GuessSuccess]: "Correct ✅! That was a correct guess!",
  [HangmanResponseCodes.WrongGuess]: "Oops! That was a wrong guess!",
  [HangmanResponseCodes.WrongWordGuess]: "Incorrect ❌! That was not the correct word.",
  [HangmanResponseCodes.NextUp]: (user: User) => `Next turn is for ${user}.`,
  [HangmanResponseCodes.Winner]: (user: User, word: string) =>
    `The winner of this game is ${user} 🎊. The correct word was \`${word}\`.`,
  [HangmanResponseCodes.NotInitialized]:
    "Something went wrong! CurrentPlayer is not initialized yet. Did you call `initialize()`?.",
  [HangmanResponseCodes.FirstRound]: (user: User) =>
    `${user} will start with the first round. The game will start in 3s, be ready!`,
  [HangmanResponseCodes.GuessedFullWord]: (user: User, word: string) =>
    `${user} has correctly guessed the word! Congrats 🎊. The word was \`${word}\`.`,
  [HangmanResponseCodes.SingleModeStart]: (lives: number) =>
    `The game will start in 3s. You'll have ${lives} lives, each incorrect guess will cost you one live. Try to guess the word before you lives runs out. Good luck!`,
  [HangmanResponseCodes.LivesExhausted]: (word: string) =>
    `Sorry! Looks like you have exhausted your lives. Better luck next time! \`${word}\` was the correct word.`,
  [HangmanResponseCodes.EndmGame]: `Stopped the game!`,
};
const getHangmanResponse = (code: HangmanResponseCodes, ...args: any[]) => {
  const response = HangmanResponses[code];
  if (typeof response === "function") return response(...args);
  return response;
};
