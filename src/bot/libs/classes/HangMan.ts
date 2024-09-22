import type { SendableChannels, User } from "discord.js";

/** Hangman game manager */
class Hangman {
  /** Winner of this hangman game */
  public winner: null | User = null;

  /** Mode of this game, for "single" games, players will not be able to use custom types */
  public mode: "single" | "double" = "single";

  /** Type of the game, "custom" is only available for double player games */
  public type: "custom" | "random" = "random";

  /** Remaining lives of the player in single-mode game */
  public livesRemaining: number = 6;

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
    this.players = option.players;
    if (option.type === "custom" && !option.word) {
      throw new Error("Option 'word' must be provided if the game type is set to 'custom'");
    }
    if (option.word) this.word = option.word;
    else this.word = "Hello";
  }
  public inititalize() {
    this.alphabets = this.word.split("").map((w, i) => ({ guessed: false, alphabet: w, position: i }));
    this.currentPlayer = this.players.random();
    if (this.mode === "double") this.startDoubleModeGame();
    else if (this.mode === "single") this.startSingleModeGame();
  }
  private startDoubleModeGame() {}
  private startSingleModeGame() {}

  private validateAnswer(word: string) {
    if (EnglishAlphabets.some((a) => a !== word) && word !== this.word) return HangmanResponseCodes.NotAnAlphabet;
    if (this.guessedAlphabets.some((a) => a === word)) return HangmanResponseCodes.AlreadyGuessed;
    this.guessedAlphabets.push(word as (typeof EnglishAlphabets)[number]);

    // prettier-ignore
    if (!this.alphabets) throw new Error("Alphabets not initialized, the game may have been started without proper initialization");

    if (this.alphabets.some((a) => a.alphabet !== word)) return HangmanResponseCodes.WrongGuess;
    this.alphabets.find((a) => a.alphabet === word)!.guessed = true;
    return HangmanResponseCodes.GuessSuccess;
  }

  private async getCollectorResponse() {
    if (!this.currentPlayer) {
      throw new Error("Something went wrong! CurrentPlayer is not initialized yet. Did you call `initialize()`?");
    }
    const curr = this.currentPlayer;
    const col = await this.channel.awaitMessages({ time: 30_000, filter: (m) => m.author.id === curr.id, max: 1 });
    if (!col.size) return "Timeout";
    return col.first()!;
  }
}

type HangmanOptions = { mode?: "single" | "double"; type?: "custom" | "random"; players: User[]; word?: string };

type HangmanWords = {
  guessed: boolean;
  alphabet: string;
  position: number;
}[];

type SinglePlayerStat = {
  livesRemaining: number;
  guessedFirstWord: boolean;
};

const EnglishAlphabets = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
] as const;

enum HangmanResponseCodes {
  Timeout,
  NotAnAlphabet,
  AlreadyGuessed,
  WrongGuess,
  GuessSuccess,
  NextUp,
  Winner,
}

const HangmanResponses: Record<HangmanResponseCodes, string | ((...args: any[]) => string)> = {
  [HangmanResponseCodes.Timeout]: `Timedout! You took too long to answer`,
  [HangmanResponseCodes.NotAnAlphabet]: "The given answer is not english alphabet or the correct word",
  [HangmanResponseCodes.AlreadyGuessed]: (letter: string) => `\`${letter}\` has already be guess`,
  [HangmanResponseCodes.GuessSuccess]: "Correct ✅! That was a correct guess!",
  [HangmanResponseCodes.WrongGuess]: "Oops! That was a wrong guess!",
  [HangmanResponseCodes.NextUp]: (user: User) => `Next turn is for ${user}`,
  [HangmanResponseCodes.Winner]: (user: User) => `The winner of this game is ${user}`,
};
const getHangmanResponse = (code: HangmanResponseCodes, ...args: any[]) => {
  const response = HangmanResponses[code];
  if (typeof response === "function") return response(...args);
  return response;
};
