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

  /** The word for the game */
  public word: string;

  public alphabets: HangmanWords | null = null;

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

    // prettier-ignore
    if (this.mode === "single" && option.totalLives) (this.totalLives = option.totalLives), (this.remainingLives = option.totalLives);

    if (option.type === "custom") {
      if (!option.word) throw new Error("Option 'word' must be provided if the game type is set to 'custom'");
      this.word = option.word;
    } else {
      this.word = hangmanWords.random();
    }
  }
  public inititalize() {
    this.alphabets = this.word.split("").map((w, i) => ({
      guessed: EnglishAlphabets.some((wo) => wo.toLowerCase() === w.toLowerCase()) ? false : true, // Make any non-english characters already guessed
      alphabet: w,
      position: i,
      guessedBy: null,
    }));
    this.currentPlayer = this.players.random();
    if (this.mode === "double") this.startDoubleModeGame();
    else if (this.mode === "single") this.startSingleModeGame();
  }
  private async startDoubleModeGame() {
    this.sendResponse(getHangmanResponse(HangmanResponseCodes.FirstRound, this.currentPlayer));
    await wait(3000);
    const collectResponse = async () => {
      await this.sendResponse({ embeds: [this.getEmbed()] });
      const res = await this.getCollectorResponse();
      if (res === "Timeout") {
        this.currentPlayer = this.players.find((p) => p.id !== this.currentPlayer!.id)!;
        this.sendResponse(
          getHangmanResponse(HangmanResponseCodes.Timeout) + getHangmanResponse(HangmanResponseCodes.NextUp, this.currentPlayer),
        );
        return collectResponse();
      }
      const validate = this.validateAnswer(res.content.toLowerCase());
      switch (validate) {
        case HangmanResponseCodes.GuessedFullWord: {
          this.winner = this.currentPlayer;
          this.sendResponse(getHangmanResponse(validate, this.winner, this.word));
          await wait(2000);
          return this.endGame();
        }
        case HangmanResponseCodes.GuessSuccess:
          this.sendResponse(
            getHangmanResponse(validate) + " " + getHangmanResponse(HangmanResponseCodes.NextUp, this.currentPlayer),
          );
          if (this.alphabets!.every((a) => a.guessed)) {
            this.winner = this.currentPlayer;
            this.sendResponse(getHangmanResponse(HangmanResponseCodes.Winner, this.winner, this.word));
            await wait(2000);
            return this.endGame();
          }
          await wait(2000);
          return collectResponse();
        default: {
          this.currentPlayer = this.players.find((p) => p.id !== this.currentPlayer!.id)!;
          this.sendResponse(
            getHangmanResponse(validate, res.content) + " " + getHangmanResponse(HangmanResponseCodes.NextUp, this.currentPlayer),
          );
          await wait(3000);
          return collectResponse();
        }
      }
    };
    collectResponse();
  }
  private async startSingleModeGame() {
    await this.sendResponse(getHangmanResponse(HangmanResponseCodes.SingleModeStart, this.totalLives));
    await wait(3000);
    const collectResponse = async () => {
      await this.sendResponse({ embeds: [this.getEmbed()] });
      const res = await this.getCollectorResponse();
      if (res === "Timeout") {
        this.sendResponse(getHangmanResponse(HangmanResponseCodes.Timeout));
        return collectResponse();
      }
      const validate = this.validateAnswer(res.content.toLowerCase());
      switch (validate) {
        case HangmanResponseCodes.GuessedFullWord: {
          this.winner = this.currentPlayer;
          this.sendResponse(getHangmanResponse(validate, this.winner, this.word));
          await wait(2000);
          return this.endGame();
        }
        case HangmanResponseCodes.GuessSuccess:
          this.sendResponse(getHangmanResponse(validate));
          if (this.alphabets!.every((a) => a.guessed)) {
            this.winner = this.currentPlayer;
            this.sendResponse(getHangmanResponse(HangmanResponseCodes.Winner, this.winner, this.word));
            await wait(2000);
            return this.endGame();
          }
          await wait(2000);
          return collectResponse();
        default: {
          this.sendResponse(getHangmanResponse(validate, res.content));
          this.remainingLives--;
          await wait(3000);

          // prettier-ignore
          if (this.remainingLives <= 0) return this.sendResponse(getHangmanResponse(HangmanResponseCodes.LivesExhausted, this.word));
          return collectResponse();
        }
      }
    };
    collectResponse();
  }

  private validateAnswer(word: string) {
    if (word.length > 1 && word !== this.word.toLowerCase()) return HangmanResponseCodes.WrongWordGuess;
    if (!EnglishAlphabets.some((a) => a.toLowerCase() === word) && word !== this.word.toLowerCase()) {
      return HangmanResponseCodes.NotAnAlphabet;
    }
    if (this.guessedAlphabets.some((a) => a.toLowerCase() === word)) return HangmanResponseCodes.AlreadyGuessed;
    if (this.word.toLowerCase() === word) return HangmanResponseCodes.GuessedFullWord;
    this.guessedAlphabets.push(word as (typeof EnglishAlphabets)[number]);

    // prettier-ignore
    if (!this.alphabets) throw new Error("Alphabets not initialized, the game may have been started without proper initialization");

    if (!this.alphabets.some((a) => a.alphabet.toLowerCase() === word)) return HangmanResponseCodes.WrongGuess;
    this.alphabets.forEach((alp) => {
      if (alp.alphabet.toLowerCase() === word) (alp.guessed = true), (alp.guessedBy = this.currentPlayer);
    });
    return HangmanResponseCodes.GuessSuccess;
  }

  private async getCollectorResponse() {
    if (!this.currentPlayer) {
      throw new Error(getHangmanResponse(HangmanResponseCodes.NotInitialized));
    }
    const curr = this.currentPlayer;
    const col = await this.channel.awaitMessages({ time: 30_000, filter: (m) => m.author.id === curr.id, max: 1 });
    if (!col.size) return "Timeout";
    return col.first()!;
  }

  private getEmbed() {
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
    return new EmbedBuilder().setDescription(
      `## ${this.mode === "single" ? `${this.currentPlayer} is currently guessing!` : `It's ${this.currentPlayer} turn!`}\nWord: ${this.alphabets
        .map((a) => {
          if (a.guessed) return a.alphabet;
          else return "ℹ️";
        })
        .join("")}\n\n**Guessed Alphabets:**\n > ${this.guessedAlphabets.map((g) => `\`${g.toUpperCase()}\``).join(", ")}${
        this.mode === "single" ? `\n\n**Remaining Lives(${this.remainingLives}):** ${remaininglives}` : ""
      }\n\nRemaining Time: <a:30s:1287391044127952947>`,
    );
  }

  private endGame() {}

  private async sendResponse(payload: string | MessageCreateOptions) {
    const createPayload = typeof payload === "string" ? { content: payload } : payload;
    await this.channel.send({ ...createPayload, allowedMentions: { parse: ["users"] } });
  }
}
type HangmanOptionsBase = { mode?: "single" | "double"; players: User[]; totalLives?: number };
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

type SinglePlayerStat = {
  livesRemaining: number;
  guessedFirstWord: boolean;
};

// prettier-ignore
const EnglishAlphabets = [ "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l",
"m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"] as const;

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
}

const HangmanResponses: Record<HangmanResponseCodes, string | ((...args: any[]) => string)> = {
  [HangmanResponseCodes.Timeout]: `Timed-out! You took too long to answer.`,
  [HangmanResponseCodes.NotAnAlphabet]: "The given answer is not an English alphabet!",
  [HangmanResponseCodes.AlreadyGuessed]: (letter: string) => `\`${letter}\` has already be guess.`,
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
};
const getHangmanResponse = (code: HangmanResponseCodes, ...args: any[]) => {
  const response = HangmanResponses[code];
  if (typeof response === "function") return response(...args);
  return response;
};
