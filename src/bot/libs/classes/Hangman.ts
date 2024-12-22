import {
  EmbedBuilder,
  type SendableChannels,
  type User,
  type MessageCreateOptions,
  AttachmentBuilder,
  MessageCollector,
} from "discord.js";
import { setTimeout as wait } from "timers/promises";
import { hangmanWords, HangmanResponseCodes, getHangmanResponse, EnglishAlphabets } from "../constants/hangman.js";
import { drawHangmanGallow } from "./HangmanGallowImage.js";

type ModeType = "single" | "double";
type WordType = "random" | "custom";
/** Hangman game manager */
export class Hangman<T extends ModeType, K extends WordType> {
  /** Winner of this hangman game */
  public winner: null | User = null;

  /** Mode of this game, for "single" games, players will not be able to use custom types */
  public mode: "single" | "double" = "single";

  /** Type of the game, "custom" is only available for double player games */
  public type: "custom" | "random" = "random";

  /** Total lives of the player in single-mode game */
  public totalLives: number = 6;

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

  /** Whether this game is stopped or not */
  private _stopped: boolean = false;

  /** Collector listening for stop */
  private _stopCollector: MessageCollector | null = null;

  // #region constructor
  constructor(
    private readonly channel: SendableChannels,
    option: HangmanOptions<T, K>,
  ) {
    if (option.mode) this.mode = option.mode;

    if (this.mode === "single" && option.players.length > 1) throw new Error("Only one player must be provided for single mode");

    this.players = option.players;
    for (const player of this.players) {
      this.playerStats.set(player.id, { incorrectGuesses: 0, correctGuesses: 0 });
    }
    // prettier-ignore
    if (this.mode === "single" && "totalLives" in option && option.totalLives) (this.totalLives = option.totalLives), (this.remainingLives = option.totalLives);

    if (option.type === "custom") {
      if ("word" in option) {
        this.word = option.word;
      } else {
        throw new Error("Option 'word' must be provided if the game type is set to 'custom'");
      }
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
    await wait(3000);
    this._collectResponse();
    this._listenForStop();
  }

  // #region Collect Response
  private async _collectResponse(): Promise<any> {
    if (this._stopped) return;
    await this._sendResponse(await this._getEmbedResponse());
    const res = await this._getCollectorResponse();
    if (this._stopped) return;
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
        this._sendResponse(getHangmanResponse(validate, this.winner, this.word));
        await wait(2000);
        return this._endGame();
      }
      case HangmanResponseCodes.GuessSuccess: {
        this._sendResponse(
          getHangmanResponse(validate) +
            (this.mode === "double" ? " " + getHangmanResponse(HangmanResponseCodes.NextUp, this.currentPlayer) : ""),
        );

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

  // #region validate
  private _validateAnswer(word: string) {
    if (this.word.toLowerCase() === word) {
      // Add unguessed words to the player stats before marking them all guessed
      const unguessedWords = this.alphabets!.filter((a) => !a.guessed);
      const stat = this.playerStats.get(this.currentPlayer!.id)!;
      stat.correctGuesses += unguessedWords.length;
      this.playerStats.set(this.currentPlayer!.id, stat);
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
    const stat = this.playerStats.get(this.currentPlayer!.id)!;
    stat.correctGuesses += this.alphabets.filter((a) => a.alphabet.toLowerCase() === word).length;
    this.playerStats.set(this.currentPlayer!.id, stat);
    return HangmanResponseCodes.GuessSuccess;
  }

  // #region Collector response
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

  // #region response embed
  private async _getEmbedResponse() {
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
    const embed = new EmbedBuilder().setTitle("Skygame: Hangman [BETA]").setDescription(
      `## ${this.mode === "single" ? `${this.currentPlayer} is currently guessing!` : `It's ${this.currentPlayer} turn!`}\nWord: **${this.alphabets
        .map((a) => {
          if (a.guessed) return a.alphabet === " " ? a.alphabet + "  " : `${a.alphabet}`;
          else return "◼️";
        })
        .join(
          "",
        )}** (${this.alphabetLength!} alphabets excluding special characters)\n\n**Guessed Alphabets:**\n > ${this.guessedAlphabets.map((g) => `\`${g.toUpperCase()}\``).join(", ")}${
        this.mode === "single" ? `\n\n**Remaining Lives(${this.remainingLives}):** ${remaininglives}` : ""
      }\n\nRemaining Time: <a:30sec:1288835107804676243>\n\n-# The game initiator can stop the game anytime by typing \`>stopgame\`.`,
    );
    let files = null;
    if (this.mode === "single") {
      const attach = new AttachmentBuilder(await drawHangmanGallow(this.remainingLives, this.currentPlayer), {
        name: "hangmanGallow.png",
      });
      embed.setThumbnail("attachment://hangmanGallow.png");
      files = [attach];
    }
    return { embeds: [embed], ...(files ? { files } : {}) };
  }

  // #region end game
  private async _endGame(reason?: string) {
    if (this._stopCollector && !this._stopCollector.ended) this._stopCollector.stop();
    if (this.winner) {
      const user = await this.channel.client.database.getUser(this.winner);
      // prettier-ignore
      if (!user.hangman) user.hangman = { singleMode: { gamesPlayed: 0, gamesWon: 0 }, doubleMode: { gamesPlayed: 0, gamesWon:0 } } ;
      user.hangman[this.mode === "single" ? "singleMode" : "doubleMode"].gamesWon++;
      await user.save();
    }
    if (!reason || reason !== "stopped-game") {
      this.players.forEach(async (player) => {
        const user = await this.channel.client.database.getUser(player);
        // prettier-ignore
        if (!user.hangman) user.hangman = { singleMode: { gamesPlayed: 0, gamesWon: 0 }, doubleMode: { gamesPlayed: 0, gamesWon:0 } };
        user.hangman[this.mode === "single" ? "singleMode" : "doubleMode"].gamesPlayed++;
        await user.save();
      });
    }
    let files: AttachmentBuilder[] = [];
    const embed = new EmbedBuilder()
      .setTitle("SkyGame: Hangman")
      .setDescription(
        `### Winner: ${this.winner ? this.winner : "None"} \`(${this.winner?.displayName || ""})\`\n\n**Word to guess was**: ${this.word}\n\n**Stats:**\n${this._getPlayerStats()}`,
      )
      .setAuthor({ name: `SkyGame: Hangman | SkyHelper`, iconURL: this.channel.client.user.displayAvatarURL() });
    if (this.mode === "single") {
      const attach = new AttachmentBuilder(await drawHangmanGallow(this.remainingLives, this.currentPlayer!), {
        name: "hangmanGallow.png",
      });
      embed.setImage("attachment://hangmanGallow.png");
      files = [attach];
    }
    this._sendResponse({ embeds: [embed], files });
    this.channel.client.gameData.delete(this.channel.id);
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
    this._stopCollector = this.channel.createMessageCollector({ filter: (m) => m.content.toLowerCase() === ">stopgame" });
    const initiator = this.initiator;
    this._stopCollector.on("collect", async (m) => {
      if (m.author.id !== initiator.id) {
        return await this._sendResponse("Only the game initiator can stop the game.");
      }
      this._stopped = true;
      await this._sendResponse(getHangmanResponse(HangmanResponseCodes.EndmGame));
      if (this._stopCollector && !this._stopCollector.ended) this._stopCollector.stop();

      return this._endGame("stopped-game");
    });
  }
}

interface HangmanOptionsBase<T extends ModeType, K extends WordType> {
  mode: T;
  type: K;
  players: User[];
  gameInitiator?: User;
}

type HangmanOptions<T extends ModeType, K extends WordType> = HangmanOptionsBase<T, K> &
  (T extends "single" ? { totalLives?: number } : {}) &
  (K extends "custom" ? { word: string } : {});

type HangmanWords = {
  guessed: boolean;
  alphabet: string;
  position: number;
  guessedBy: User | null;
}[];

type PlayerStats = {
  correctGuesses: number;
  incorrectGuesses: number;
};
