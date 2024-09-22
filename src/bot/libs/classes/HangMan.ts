import { EmbedBuilder, type SendableChannels, type User } from "discord.js";
import { setTimeout as wait } from "timers/promises";

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
  private async startDoubleModeGame() {
    this.channel.send(getHangmanResponse(HangmanResponseCodes.FirstRound, this.currentPlayer));

    await wait(3000);
    const collectResponse = async () => {
      await this.channel.send({ embeds: [this.getEmbed()] });
      const res = await this.getCollectorResponse();
      if (res === "Timeout") {
        this.currentPlayer = this.players.find((p) => p.id !== this.currentPlayer!.id)!;
        this.channel.send(
          getHangmanResponse(HangmanResponseCodes.Timeout) + getHangmanResponse(HangmanResponseCodes.NextUp, this.currentPlayer),
        );
        return collectResponse();
      }
      const validate = this.validateAnswer(res.content.toLowerCase());
      switch (validate) {
        case HangmanResponseCodes.GuessedFullWord: {
          this.winner = this.currentPlayer;
          this.channel.send(getHangmanResponse(validate, this.winner, this.word));
          await wait(2000);
          return this.endGame();
        }
        case HangmanResponseCodes.GuessSuccess:
          this.channel.send(
            getHangmanResponse(validate) + " " + getHangmanResponse(HangmanResponseCodes.NextUp, this.currentPlayer),
          );
          await wait(2000);
          return collectResponse();
        default: {
          this.currentPlayer = this.players.find((p) => p.id !== this.currentPlayer!.id)!;
          this.channel.send(
            getHangmanResponse(validate) + " " + getHangmanResponse(HangmanResponseCodes.NextUp, this.currentPlayer),
          );
          await wait(3000);
          return collectResponse();
        }
      }
    };
  }
  private startSingleModeGame() {}

  private validateAnswer(word: string) {
    if (EnglishAlphabets.some((a) => a !== word) && word !== this.word) return HangmanResponseCodes.NotAnAlphabet;
    if (this.guessedAlphabets.some((a) => a === word)) return HangmanResponseCodes.AlreadyGuessed;
    if (this.word === word) return HangmanResponseCodes.GuessedFullWord;
    this.guessedAlphabets.push(word as (typeof EnglishAlphabets)[number]);
    // prettier-ignore
    if (!this.alphabets) throw new Error("Alphabets not initialized, the game may have been started without proper initialization");

    if (this.alphabets.some((a) => a.alphabet !== word)) return HangmanResponseCodes.WrongGuess;
    this.alphabets.find((a) => a.alphabet === word)!.guessed = true;
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
    return new EmbedBuilder().setTitle(`It's ${this.currentPlayer} turn!`).setDescription(
      `Word: ${this.alphabets
        .map((a) => {
          if (a.alphabet === " " || a.guessed) return a.alphabet;
          else return "ℹ️";
        })
        .join(
          "",
        )}\n\nGuessed Alphabets:\n > ${this.guessedAlphabets.map((g) => `\`${g.toUpperCase()}\``).join(", ")}\n\nRemaining Time: <a:30s:1287391044127952947>`,
    );
  }

  private endGame() {}
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
  NotInitialized,
  FirstRound,
  GuessedFullWord,
}

const HangmanResponses: Record<HangmanResponseCodes, string | ((...args: any[]) => string)> = {
  [HangmanResponseCodes.Timeout]: `Timed-out! You took too long to answer.`,
  [HangmanResponseCodes.NotAnAlphabet]: "The given answer is not english alphabet or the correct word",
  [HangmanResponseCodes.AlreadyGuessed]: (letter: string) => `\`${letter}\` has already be guess`,
  [HangmanResponseCodes.GuessSuccess]: "Correct ✅! That was a correct guess!",
  [HangmanResponseCodes.WrongGuess]: "Oops! That was a wrong guess!",
  [HangmanResponseCodes.NextUp]: (user: User) => `Next turn is for ${user}`,
  [HangmanResponseCodes.Winner]: (user: User) => `The winner of this game is ${user}`,
  [HangmanResponseCodes.NotInitialized]:
    "Something went wrong! CurrentPlayer is not initialized yet. Did you call `initialize()`?",
  [HangmanResponseCodes.FirstRound]: (user: User) =>
    `${user} will start with the first round. The game will start in 3s, be ready!`,
  [HangmanResponseCodes.GuessedFullWord]: (user: User, word: string) =>
    `${user} has correctly guessed the word! Congrats 🎊. The word was \`${word}\``,
};
const getHangmanResponse = (code: HangmanResponseCodes, ...args: any[]) => {
  const response = HangmanResponses[code];
  if (typeof response === "function") return response(...args);
  return response;
};
