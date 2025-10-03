import type { APITextChannel, APIUser } from "@discordjs/core";
import { HangmanResponseCodes } from "@skyhelperbot/constants";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SkyHelper } from "../src/bot/structures/index";
import { Hangman } from "../src/bot/utils/classes/Hangman";
describe("Hangman", () => {
  let channel: APITextChannel;
  let client: SkyHelper;
  let players: APIUser[];

  beforeEach(() => {
    channel = { id: "test-channel" } as APITextChannel;
    client = {
      api: {
        channels: {
          createMessage: vi.fn(),
        },
      },
      logger: {
        error: vi.fn(),
      },
      awaitMessages: vi.fn().mockResolvedValue([{ content: "hi" }]),
      schemas: {
        getUser: vi.fn().mockResolvedValue({
          save: vi.fn(),
        }),
      },
      gameData: new Map(),
      user: { id: "bot-id" },
      utils: {
        getUserAvatar: vi.fn().mockReturnValue("avatar-url"),
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
      // @ts-expect-error - word is intentionally omitted to trigger validation error
      new Hangman(channel, { mode: "double", type: "custom", players }, client);
    }).toThrow("Option 'word' must be provided if the game type is set to 'custom'");
  });

  it("should correctly validate a guessed word", async () => {
    const hangman = new Hangman(channel, { mode: "single", type: "custom", players: [players[0]], word: "test" }, client);
    await hangman.inititalize();
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const result = hangman["_validateAnswer"]("test");
    expect(result).toBe(HangmanResponseCodes.GuessedFullWord);
  });

  it("should correctly validate a guessed alphabet", async () => {
    const hangman = new Hangman(channel, { mode: "single", type: "custom", players: [players[0]], word: "test" }, client);
    await hangman.inititalize();
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const result = hangman["_validateAnswer"]("t");
    expect(result).toBe(HangmanResponseCodes.GuessSuccess);
  });

  it("should return wrong guess for incorrect alphabet", async () => {
    const hangman = new Hangman(channel, { mode: "single", type: "custom", players: [players[0]], word: "test" }, client);
    await hangman.inititalize();
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const result = hangman["_validateAnswer"]("z");
    expect(result).toBe(HangmanResponseCodes.WrongGuess);
  });

  it("should return not an alphabet for non-alphabet characters", async () => {
    const hangman = new Hangman(channel, { mode: "single", type: "custom", players: [players[0]], word: "test" }, client);
    await hangman.inititalize();
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const result = hangman["_validateAnswer"]("1");
    expect(result).toBe(HangmanResponseCodes.NotAnAlphabet);
  });

  it("should return already guessed for previously guessed alphabet", async () => {
    const hangman = new Hangman(channel, { mode: "single", type: "custom", players: [players[0]], word: "test" }, client);
    await hangman.inititalize();
    // eslint-disable-next-line @typescript-eslint/dot-notation
    hangman["_validateAnswer"]("t");
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const result = hangman["_validateAnswer"]("t");
    expect(result).toBe(HangmanResponseCodes.AlreadyGuessed);
  });
});
