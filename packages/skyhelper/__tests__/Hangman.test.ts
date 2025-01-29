import type { APITextChannel, APIUser } from "@discordjs/core";
import { SkyHelper } from "../src/bot/structures/index";
import { Hangman } from "../src/bot/utils/classes/Hangman";
import { jest, describe, beforeEach, expect, it } from "@jest/globals";
import { HangmanResponseCodes } from "@skyhelperbot/constants";
describe("Hangman", () => {
  let channel: APITextChannel;
  let client: SkyHelper;
  let players: APIUser[];

  beforeEach(() => {
    channel = { id: "test-channel" } as APITextChannel;
    client = {
      api: {
        channels: {
          createMessage: jest.fn(),
        },
      },
      // @ts-expect-error
      awaitMessages: jest.fn().mockResolvedValue([{ content: "hi" }]),
      schemas: {
        // @ts-expect-error
        getUser: jest.fn().mockResolvedValue({
          save: jest.fn(),
        }),
      },
      gameData: new Map(),
      user: { id: "bot-id" },
      utils: {
        getUserAvatar: jest.fn().mockReturnValue("avatar-url"),
      },
    } as unknown as SkyHelper;
    players = [{ id: "player1", username: "Player 1" } as APIUser, { id: "player2", username: "Player 2" } as APIUser];
  });

  it("should initialize a single player game with random word", async () => {
    const hangman = new Hangman(channel, { mode: "single", type: "random", players: [players[0]] }, client);
    await hangman.inititalize();
    expect(hangman.word).toBeDefined();
    expect(hangman.players.length).toBe(1);
    expect(hangman.totalLives).toBe(6);
    expect(hangman.remainingLives).toBe(6);
  });

  it("should initialize a double player game with custom word", async () => {
    const hangman = new Hangman(channel, { mode: "double", type: "custom", players, word: "customword" }, client);
    await hangman.inititalize();
    expect(hangman.word).toBe("customword");
    expect(hangman.players.length).toBe(2);
  });

  it("should throw error if more than one player is provided for single mode", () => {
    expect(() => {
      new Hangman(channel, { mode: "single", type: "random", players }, client);
    }).toThrow("Only one player must be provided for single mode");
  });

  it("should throw error if custom word is not provided for custom type", () => {
    expect(() => {
      // @ts-expect-error
      new Hangman(channel, { mode: "double", type: "custom", players }, client);
    }).toThrow("Option 'word' must be provided if the game type is set to 'custom'");
  });

  it("should correctly validate a guessed word", async () => {
    const hangman = new Hangman(channel, { mode: "single", type: "custom", players: [players[0]], word: "test" }, client);
    await hangman.inititalize();
    const result = hangman["_validateAnswer"]("test");
    expect(result).toBe(HangmanResponseCodes.GuessedFullWord);
  });

  it("should correctly validate a guessed alphabet", async () => {
    const hangman = new Hangman(channel, { mode: "single", type: "custom", players: [players[0]], word: "test" }, client);
    await hangman.inititalize();
    const result = hangman["_validateAnswer"]("t");
    expect(result).toBe(HangmanResponseCodes.GuessSuccess);
  });

  it("should return wrong guess for incorrect alphabet", async () => {
    const hangman = new Hangman(channel, { mode: "single", type: "custom", players: [players[0]], word: "test" }, client);
    await hangman.inititalize();
    const result = hangman["_validateAnswer"]("z");
    expect(result).toBe(HangmanResponseCodes.WrongGuess);
  });

  it("should return not an alphabet for non-alphabet characters", async () => {
    const hangman = new Hangman(channel, { mode: "single", type: "custom", players: [players[0]], word: "test" }, client);
    await hangman.inititalize();
    const result = hangman["_validateAnswer"]("1");
    expect(result).toBe(HangmanResponseCodes.NotAnAlphabet);
  });

  it("should return already guessed for previously guessed alphabet", async () => {
    const hangman = new Hangman(channel, { mode: "single", type: "custom", players: [players[0]], word: "test" }, client);
    await hangman.inititalize();
    hangman["_validateAnswer"]("t");
    const result = hangman["_validateAnswer"]("t");
    expect(result).toBe(HangmanResponseCodes.AlreadyGuessed);
  });
});
