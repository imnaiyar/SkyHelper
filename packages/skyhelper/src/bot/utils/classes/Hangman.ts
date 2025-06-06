import { setTimeout as wait } from "timers/promises";
import { hangmanWords, HangmanResponseCodes, getHangmanResponse, EnglishAlphabets, emojis } from "@skyhelperbot/constants";
import {
  AllowedMentionsTypes,
  ComponentType,
  MessageFlags,
  type APITextChannel,
  type APIUser,
  type RESTPostAPIChannelMessageJSONBody,
} from "@discordjs/core";
import { InteractionCollector } from "./Collector.js";
import type { SkyHelper } from "@/structures";
import { updateUserGameStats } from "../utils.js";
import { container, section, separator, textDisplay } from "@skyhelperbot/utils";
import { CustomId, store } from "../customId-store.js";
declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Array<T> {
    random(): this[number];
  }
}
// prettier-ignore
Array.prototype.random = function() {
  return this[Math.floor(Math.random() * this.length)];
};
type ModeType = "single" | "double";
type WordType = "random" | "custom";
/** Hangman game manager */
export class Hangman<T extends ModeType, K extends WordType> {
  /** Winner of this hangman game */
  public winner: null | APIUser = null;

  /** Mode of this game, for "single" games, players will not be able to use custom types */
  public mode: "single" | "double" = "single";

  /** Type of the game, "custom" is only available for double player games */
  public type: "custom" | "random" = "random";

  /** Total lives of the player in single-mode game */
  public totalLives: number = 6;

  /** Remaining lives of the player in single-mode game */
  public remainingLives: number = this.totalLives;

  /** The player whose current turn is (in double-mode game) */
  private currentPlayer: APIUser | null = null;

  /** Players participating in this game */
  public players: APIUser[];

  /** Player stats for the game */
  public playerStats: Map<string, PlayerStats> = new Map();

  /** The word for the game */
  public word: string;

  /** Original initiator of the game, used for managing the games, like stopping it mid interval  */
  public initiator: APIUser | null = null;

  public alphabets: HangmanWords | null = null;

  public alphabetLength: number | null = null;

  /** The english alphabets that has been guessed */
  private guessedAlphabets: (typeof EnglishAlphabets)[number][] = [];

  /** Whether this game is stopped or not */
  private _stopped: boolean = false;

  /** Collector listening for stop */
  private _stopCollector: InteractionCollector<ComponentType.Button> | null = null;

  // #region constructor
  constructor(
    private readonly channel: APITextChannel,
    option: HangmanOptions<T, K>,
    readonly client: SkyHelper,
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
      await this._sendResponse(getHangmanResponse(HangmanResponseCodes.FirstRound, this.currentPlayer.id));
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
          (this.mode === "double" ? getHangmanResponse(HangmanResponseCodes.NextUp, this.currentPlayer!.id) : ""),
      );
      return this._collectResponse();
    }
    const validate = this._validateAnswer(res.content.toLowerCase());
    switch (validate) {
      case HangmanResponseCodes.GuessedFullWord: {
        this.winner = this.currentPlayer;
        this._sendResponse(getHangmanResponse(validate, this.winner!.id, this.word));
        await wait(2000);
        return this._endGame();
      }
      case HangmanResponseCodes.GuessSuccess: {
        this._sendResponse(
          getHangmanResponse(validate) +
            (this.mode === "double" ? " " + getHangmanResponse(HangmanResponseCodes.NextUp, this.currentPlayer!.id) : ""),
        );

        if (this.alphabets!.every((a) => a.guessed)) {
          this.winner = this.currentPlayer;
          this._sendResponse(getHangmanResponse(HangmanResponseCodes.Winner, this.winner!.id, this.word));
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
        if (this.mode === "double") this._sendResponse(getHangmanResponse(HangmanResponseCodes.NextUp, this.currentPlayer?.id));
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
    const col = await this.client
      .awaitMessages({
        timeout: 30_000,
        filter: (m) => m.author.id === curr.id && m.content.toLowerCase() !== ">stopgame",
        max: 1,
        channel: this.channel,
      })
      .catch(() => []);
    if (!col.length) return "Timeout";
    return col[0]!;
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

    const component = container(
      section(
        {
          label: "End Game",
          style: 4,
          custom_id: store.serialize(CustomId.SkyGameEndGame, { user: null }),
          type: 2,
        },
        "-# Skygame: Hangman",
        `## ${this.mode === "single" ? `<@${this.currentPlayer.id}> is currently guessing!` : `It's <@${this.currentPlayer.id}> turn!`}`,
      ),
      separator(),
      textDisplay(
        `Word: **${this.alphabets
          .map((a) => {
            if (a.guessed) return a.alphabet === " " ? a.alphabet + "  " : `${a.alphabet}`;
            else return "◼️";
          })
          .join("")}** (${this.alphabetLength!} alphabets excluding special characters)`,
        `\n**Guessed Alphabets:**\n > ${this.guessedAlphabets.map((g) => `\`${g.toUpperCase()}\``).join(", ")}`,
        this.mode === "single" ? `\n**Remaining Lives(${this.remainingLives}):** ${remaininglives}` : "",
        `Remaining Time: ${emojis["30s_timer"]}`,
      ),
    );
    return { components: [component], flags: MessageFlags.IsComponentsV2 };
  }

  // #region end game
  private async _endGame(reason?: string) {
    if (this._stopCollector && !this._stopCollector.ended) this._stopCollector.stop();

    if (!reason || reason !== "stopped-game") {
      for (const player of this.players) {
        updateUserGameStats(
          player,
          "hangman",
          this.mode === "single" ? "singleMode" : "doubleMode",
          player.id === this.winner?.id,
        ).catch(this.client.logger.error);
      }
    }

    const comp = container(
      textDisplay(`-# SkyHelper`, "### Skygame: Hangman"),
      separator(),
      textDisplay(
        `### Winner: ${this.winner ? `<@${this.winner.id}>` : "None"} \`(${this.winner?.username || ""})\``,
        `**Word to guess was**: ${this.word}`,
      ),
      separator(),
      textDisplay("**Stats:**", this._getPlayerStats()),
    );
    this._sendResponse({ components: [comp], flags: MessageFlags.IsComponentsV2 });
    this.client.gameData.delete(this.channel.id);
  }

  private _getPlayerStats() {
    return this.players
      .map((player) => {
        const stat = this.playerStats.get(player.id)!;
        const correctGuesses = stat.correctGuesses;
        const incorrectGuesses = stat.incorrectGuesses;
        const correctPercent = (correctGuesses / this.alphabetLength!) * 100;
        const incorrectPercent = (incorrectGuesses / this.alphabetLength!) * 100;
        return `- <@${player.id}> - \`${player.username}\`: Correct Guesses: ${correctGuesses}/${this.alphabetLength!} (${correctPercent.toFixed(2)}%), Incorrect Guesses: ${incorrectGuesses} (${incorrectPercent.toFixed(2)})`;
      })
      .join("\n");
  }

  private async _sendResponse(payload: RESTPostAPIChannelMessageJSONBody | string) {
    const createPayload = typeof payload === "string" ? { content: payload } : payload;
    return await this.client.api.channels.createMessage(this.channel.id, {
      ...createPayload,
      allowed_mentions: {
        parse: [AllowedMentionsTypes.User],
      },
    });
  }

  private _listenForStop() {
    if (!this.initiator) return;
    this._stopCollector = new InteractionCollector(this.client, {
      componentType: 2,
      filter: (i) => store.deserialize(i.data.custom_id).id === CustomId.SkyGameEndGame,
      channel: this.channel,
    });
    const initiator = this.initiator;
    this._stopCollector.on("collect", async (i) => {
      if ((i.member?.user || i.user!).id !== initiator.id) {
        return await this.client.api.interactions.reply(i.id, i.token, {
          content: "Only this game's initiator can end the game.",
          flags: 64,
        });
      }
      this._stopped = true;

      await this.client.api.interactions.reply(i.id, i.token, {
        content: "The game was stopped by the game initiator!",
      });

      if (this._stopCollector && !this._stopCollector.ended) this._stopCollector.stop();

      return this._endGame("stopped-game");
    });
  }
}

interface HangmanOptionsBase<T extends ModeType, K extends WordType> {
  mode: T;
  type: K;
  players: APIUser[];
  gameInitiator?: APIUser;
}

type HangmanOptions<T extends ModeType, K extends WordType> = HangmanOptionsBase<T, K> &
  (T extends "single" ? { totalLives?: number } : {}) &
  (K extends "custom" ? { word: string } : {});

type HangmanWords = {
  guessed: boolean;
  alphabet: string;
  position: number;
  guessedBy: APIUser | null;
}[];

type PlayerStats = {
  correctGuesses: number;
  incorrectGuesses: number;
};
