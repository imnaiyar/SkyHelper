import { Hangman } from "../src/bot/libs/classes/Hangman";
import { User, TextChannel, Collection } from "discord.js";
import { jest, describe, beforeEach, it, expect } from "@jest/globals";
/* eslint-disable space-before-function-paren */
// extenders for the <Array>.prototype.random() and <Array>.prototype.last() methods
// @ts-ignore
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};
// @ts-ignore
Array.prototype.last = function () {
  return this[this.length - 1];
};

describe("Hangman", () => {
  let channel: TextChannel;
  let user1: User;
  let user2: User;

  beforeEach(() => {
    channel = {
      send: jest.fn(),
      // @ts-ignore
      awaitMessages: jest.fn().mockResolvedValue({ size: 0 }),
      createMessageCollector: jest.fn().mockReturnValue({
        on: jest.fn(),
        stop: jest.fn(),
      }),
      client: {
        user: {
          displayAvatarURL: jest.fn().mockReturnValue("https://skyhelper.xyz/assets/img/boticon.png"),
        },
        database: {
          // @ts-ignore
          getUser: jest.fn().mockResolvedValue({ save: jest.fn().mockResolvedValue({}) }),
        },
        gameData: new Collection(),
      },
    } as unknown as TextChannel;
    // @ts-ignore
    user1 = {
      id: "user1",
      displayName: "User1",
      client: {
        user: {
          displayAvatarURL: jest.fn().mockReturnValue("https://skyhelper.xyz/assets/img/boticon.png"),
        },
      },
    } as User;
    // @ts-ignore
    user2 = {
      id: "user2",
      displayName: "User2",
      client: {
        user: {
          displayAvatarURL: jest.fn().mockReturnValue("https://skyhelper.xyz/assets/img/boticon.png"),
        },
      },
    } as User;

    for (const user of [user1, user2]) {
      // @ts-ignore
      user.displayAvatarURL = jest.fn().mockReturnValue("https://skyhelper.xyz/assets/img/boticon.png");
    }
  });

  it("should initialize with single mode and random word", () => {
    const hangman = new Hangman(channel, { mode: "single", type: "random", players: [user1] });
    expect(hangman.mode).toBe("single");
    expect(hangman.players).toEqual([user1]);
    expect(hangman.type).toBe("random");
    expect(hangman.totalLives).toBe(6);
    expect(hangman.remainingLives).toBe(6);
  });

  it("should initialize with double mode and custom word", () => {
    const hangman = new Hangman(channel, { mode: "double", players: [user1, user2], type: "custom", word: "test" });
    expect(hangman.mode).toBe("double");
    expect(hangman.players).toEqual([user1, user2]);
    expect(hangman.word).toBe("test");
  });

  it("should throw error if more than one player is provided in single mode", () => {
    expect(() => {
      new Hangman(channel, { mode: "single", type: "random", players: [user1, user2] });
    }).toThrow("Only one player must be provided for single mode");
  });

  it("should throw error if custom word is not provided in custom mode", () => {
    expect(() => {
      // @ts-expect-error
      new Hangman(channel, { mode: "double", players: [user1, user2], type: "custom" });
    }).toThrow("Option 'word' must be provided if the game type is set to 'custom'");
  });

  it("should initialize alphabets correctly", async () => {
    const hangman = new Hangman(channel, { mode: "single", players: [user1], type: "custom", word: "test" });
    await hangman.inititalize();
    expect(hangman.alphabets).toEqual([
      { guessed: false, alphabet: "t", position: 0, guessedBy: null },
      { guessed: false, alphabet: "e", position: 1, guessedBy: null },
      { guessed: false, alphabet: "s", position: 2, guessedBy: null },
      { guessed: false, alphabet: "t", position: 3, guessedBy: null },
    ]);
  });
});
